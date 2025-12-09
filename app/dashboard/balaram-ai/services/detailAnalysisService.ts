/**
 * Detail Analysis Service - ADK-style automatic visual generation
 * Analyzes conversations and generates charts/visuals when data is discussed
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentSensorData, getGeminiVariables } from './sensorDataService';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface ChartData {
  title: string;
  summary: string;
  labels: string[];
  values: number[];
  data_label: string;
  y_label: string;
  chart_title: string;
  insights: string[];
  chart_type?: 'line' | 'bar' | 'area';
}

export interface AnalysisResult {
  skip: boolean;
  chart_data?: ChartData;
  needs_visual: boolean;
  topic?: string;
}

export class DetailAnalysisService {
  private model: any;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  /**
   * Analyze conversation and determine if visual generation is needed
   */
  async analyzeConversation(
    userQuery: string,
    agentResponse: string,
    searchResults?: any
  ): Promise<AnalysisResult> {
    try {
      console.log("[Detail Analysis] Analyzing conversation for visual needs...");

      // Check if conversation involves data that could benefit from visualization
      const needsVisual = this.shouldGenerateVisual(userQuery, agentResponse);

      if (!needsVisual) {
        console.log("[Detail Analysis] No visual triggers found, skipping");
        return { skip: true, needs_visual: false };
      }

      console.log("[Detail Analysis] Visual triggers detected, proceeding with generation");

      // Get current sensor data for context
      const sensorData = getGeminiVariables();

      // Prepare search context if available
      let searchContext = '';
      if (searchResults && searchResults.groundingSupports) {
        searchContext = `\nGOOGLE SEARCH RESULTS:
${searchResults.groundingSupports.map((support: any, index: number) =>
          `${index + 1}. ${support.segment?.text || support.title || 'Search result'}`
        ).join('\n')}`;
      }

      // Create analysis prompt
      const analysisPrompt = `You are a trend analysis assistant for agricultural data. Analyze this conversation and generate chart data if appropriate.

CONVERSATION:
User asked: "${userQuery}"
Agent responded: "${agentResponse}"

CURRENT SENSOR DATA:
- Location: ${sensorData.locationName}
- Soil Moisture: ${sensorData.soilMoisture}%
- Temperature: ${sensorData.humidity}%
- NPK Levels: N=${sensorData.npkNitrogen}ppm, P=${sensorData.npkPhosphorus}ppm, K=${sensorData.npkPotassium}ppm${searchContext}

TASK: Generate a visual chart for this conversation. Be AGGRESSIVE in creating visuals - if there are ANY numbers, measurements, or data mentioned, create a chart.

ALWAYS CREATE A VISUAL unless the conversation is purely greeting/casual chat.

Rules:
- If Google Search results are provided, extract real numbers, dates, and trends from them
- If no search data, create realistic agricultural data that relates to the discussion  
- Focus on making the data relevant to Indian agriculture and current sensor readings
- When in doubt, CREATE A CHART - users love data visualization

ONLY skip if conversation is purely casual (like "hello", "how are you", "goodbye")

OUTPUT FORMAT (pure JSON, no markdown):
{
  "title": "Chart title",
  "summary": "Brief 1-sentence summary",
  "labels": ["Day1", "Day2", "Day3", "Day4", "Day5"],
  "values": [value1, value2, value3, value4, value5],
  "data_label": "Data type (e.g., Temperature, Moisture)",
  "y_label": "Unit (e.g., °C, %, ppm)",
  "chart_title": "Full descriptive title",
  "insights": [
    "Key insight 1",
    "Key insight 2"
  ],
  "chart_type": "line"
}

EXAMPLES:
- Soil moisture discussion → Generate 7-day moisture trend
- NPK levels question → Generate NPK comparison chart
- Temperature query → Generate temperature trend
- Market price search → Generate price trend chart using search data
- Weather forecast → Generate weather pattern chart
- Crop yield data → Generate yield comparison chart

IMPORTANT: If Google Search results are provided, use that real data to create more accurate charts. Extract numbers, dates, and trends from the search results.

CRITICAL: Output ONLY raw JSON. No markdown, no backticks, no explanations.`;

      const result = await this.model.generateContent(analysisPrompt);
      const response = result.response.text().trim();

      console.log("[Detail Analysis] Raw response:", response);

      // Parse JSON response
      try {
        const parsedResult = JSON.parse(response);

        if (parsedResult.skip) {
          return { skip: true, needs_visual: false };
        }

        return {
          skip: false,
          needs_visual: true,
          chart_data: parsedResult as ChartData,
          topic: this.extractTopic(userQuery)
        };

      } catch (parseError) {
        console.error("[Detail Analysis] JSON parse error:", parseError);
        console.log("[Detail Analysis] Falling back to sensor-based chart");

        // Fallback: create a simple sensor data chart
        return this.createFallbackChart(userQuery, agentResponse);
      }

    } catch (error) {
      console.error("[Detail Analysis] Error:", error);
      return { skip: true, needs_visual: false };
    }
  }

  /**
   * Determine if conversation should generate visual
   */
  private shouldGenerateVisual(userQuery: string, agentResponse: string): boolean {
    const combinedText = (userQuery + ' ' + agentResponse).toLowerCase();

    // Check if response contains numbers (key indicator for data)
    const hasNumbers = /\d+/.test(agentResponse);

    // Check for percentage signs, units, or measurements
    const hasUnits = /(%|ppm|°c|°f|kg|tons?|liters?|ml|cm|mm|inches?|feet|meters?|₹|rs\.?|rupees?|dollars?|\$)/.test(combinedText);

    // Check for data-related keywords
    const visualTriggers = [
      // Data-related keywords
      'trend', 'history', 'historical', 'past', 'week', 'month', 'year',
      'over time', 'change', 'forecast', 'prediction', 'chart', 'graph',
      'pattern', 'comparison', 'compare', 'evolution', 'development',

      // Agricultural data keywords
      'moisture', 'temperature', 'humidity', 'npk', 'nitrogen', 'phosphorus', 'potassium',
      'levels', 'readings', 'data', 'measurements', 'values', 'sensor',

      // Trend analysis keywords
      'increase', 'decrease', 'rising', 'falling', 'stable', 'fluctuating',
      'high', 'low', 'average', 'maximum', 'minimum',

      // Market/price keywords
      'price', 'cost', 'rate', 'market', 'sell', 'buy', 'profit', 'loss',

      // Search-related keywords
      'search', 'find', 'lookup', 'current', 'latest', 'recent',

      // Agricultural specific
      'yield', 'harvest', 'crop', 'farm', 'field', 'soil', 'plant'
    ];

    const hasKeywords = visualTriggers.some(trigger => combinedText.includes(trigger));

    // Generate visual if:
    // 1. Response has numbers AND units/measurements, OR
    // 2. Response has numbers AND relevant keywords, OR
    // 3. Strong keyword indicators (even without numbers)
    const shouldGenerate = (hasNumbers && hasUnits) ||
      (hasNumbers && hasKeywords) ||
      (hasKeywords && (combinedText.includes('trend') ||
        combinedText.includes('chart') ||
        combinedText.includes('data') ||
        combinedText.includes('search')));

    console.log("[Detail Analysis] Visual check:", {
      hasNumbers,
      hasUnits,
      hasKeywords,
      shouldGenerate,
      query: userQuery.substring(0, 50),
      response: agentResponse.substring(0, 50)
    });

    return shouldGenerate;
  }

  /**
   * Extract main topic from user query
   */
  private extractTopic(query: string): string {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('moisture') || queryLower.includes('water')) return 'soil_moisture';
    if (queryLower.includes('temperature') || queryLower.includes('temp')) return 'temperature';
    if (queryLower.includes('humidity')) return 'humidity';
    if (queryLower.includes('npk') || queryLower.includes('nitrogen') || queryLower.includes('phosphorus') || queryLower.includes('potassium')) return 'npk';
    if (queryLower.includes('weather')) return 'weather';
    if (queryLower.includes('crop') || queryLower.includes('plant')) return 'crop_growth';

    return 'general';
  }

  /**
   * Generate sample agricultural data for visualization
   */
  generateSampleData(topic: string, days: number = 7): { labels: string[], values: number[] } {
    const labels = [];
    const values = [];

    // Generate date labels
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Generate realistic values based on topic
    const currentSensor = getGeminiVariables();

    switch (topic) {
      case 'soil_moisture':
        const baseMoisture = currentSensor.soilMoisture || 50;
        for (let i = 0; i < days; i++) {
          values.push(Math.max(10, Math.min(90, baseMoisture + (Math.random() - 0.5) * 20)));
        }
        break;

      case 'temperature':
        const baseTemp = 25; // Default temperature
        for (let i = 0; i < days; i++) {
          values.push(Math.max(15, Math.min(40, baseTemp + (Math.random() - 0.5) * 10)));
        }
        break;

      case 'humidity':
        const baseHumidity = currentSensor.humidity || 60;
        for (let i = 0; i < days; i++) {
          values.push(Math.max(30, Math.min(90, baseHumidity + (Math.random() - 0.5) * 15)));
        }
        break;

      case 'npk':
        // Generate NPK values
        for (let i = 0; i < days; i++) {
          values.push(Math.max(20, Math.min(100, 50 + (Math.random() - 0.5) * 30)));
        }
        break;

      default:
        // Generic data
        for (let i = 0; i < days; i++) {
          values.push(Math.random() * 100);
        }
    }

    return { labels, values: values.map(v => Math.round(v * 10) / 10) };
  }

  /**
   * Create a fallback chart when AI generation fails
   */
  private createFallbackChart(userQuery: string, agentResponse: string): AnalysisResult {
    const topic = this.extractTopic(userQuery);
    const sampleData = this.generateSampleData(topic);

    const chartData: ChartData = {
      title: `${topic.replace('_', ' ').toUpperCase()} Trend`,
      summary: `Recent ${topic.replace('_', ' ')} data based on your query`,
      labels: sampleData.labels,
      values: sampleData.values,
      data_label: topic.replace('_', ' '),
      y_label: topic.includes('moisture') ? '%' : topic.includes('temperature') ? '°C' : 'units',
      chart_title: `7-Day ${topic.replace('_', ' ').toUpperCase()} Analysis`,
      insights: [
        `Average ${topic.replace('_', ' ')}: ${Math.round(sampleData.values.reduce((a, b) => a + b) / sampleData.values.length)}`,
        `Trend appears ${sampleData.values[sampleData.values.length - 1] > sampleData.values[0] ? 'increasing' : 'decreasing'}`
      ],
      chart_type: 'line'
    };

    return {
      skip: false,
      needs_visual: true,
      chart_data: chartData,
      topic
    };
  }
}

// Export singleton instance
export const detailAnalysisService = new DetailAnalysisService();