/**
 * RAG (Retrieval-Augmented Generation) Service for E-Bhoomi
 * Provides contextual agricultural knowledge from local datasets
 */

interface RAGDocument {
  id: string;
  title: string;
  content: string;
  category: 'crop_management' | 'pest_control' | 'soil_health' | 'weather' | 'market_prices' | 'fertilizers' | 'irrigation';
  keywords: string[];
  relevanceScore?: number;
}

// Sample agricultural knowledge base - in production, this would come from a vector database
const AGRICULTURAL_KNOWLEDGE_BASE: RAGDocument[] = [
  {
    id: 'crop_rotation_1',
    title: 'Crop Rotation Best Practices for Indian Agriculture',
    content: 'Crop rotation is essential for maintaining soil health. For rice-wheat systems in North India, follow a 3-year rotation: Rice → Wheat → Legumes (like chickpea or lentil). This helps break pest cycles, improves soil nitrogen through legume fixation, and reduces disease pressure. In South India, rice-cotton-sugarcane rotation works well.',
    category: 'crop_management',
    keywords: ['crop rotation', 'soil health', 'rice', 'wheat', 'legumes', 'nitrogen fixation', 'pest management']
  },
  {
    id: 'npk_management_1',
    title: 'NPK Management for Optimal Crop Growth',
    content: 'Nitrogen (N): Essential for leaf growth and chlorophyll. Deficiency shows as yellowing leaves. Apply 120-150 kg/ha for rice, 100-120 kg/ha for wheat. Phosphorus (P): Critical for root development and flowering. Apply 60-80 kg/ha. Potassium (K): Improves disease resistance and water regulation. Apply 40-60 kg/ha. Split application is recommended: 50% at planting, 25% at tillering, 25% at flowering.',
    category: 'fertilizers',
    keywords: ['NPK', 'nitrogen', 'phosphorus', 'potassium', 'fertilizer', 'application rates', 'split application', 'deficiency symptoms']
  },
  {
    id: 'soil_moisture_1',
    title: 'Soil Moisture Management Techniques',
    content: 'Optimal soil moisture for most crops is 60-80% field capacity. Below 40% indicates water stress. Above 90% can cause root rot and nutrient leaching. Use drip irrigation for 30-40% water savings. Mulching with organic matter reduces evaporation by 25-30%. Monitor soil moisture at 15cm and 30cm depths for better irrigation scheduling.',
    category: 'irrigation',
    keywords: ['soil moisture', 'irrigation', 'field capacity', 'water stress', 'drip irrigation', 'mulching', 'evaporation']
  },
  {
    id: 'pest_integrated_1',
    title: 'Integrated Pest Management (IPM) Strategies',
    content: 'IPM combines biological, cultural, and chemical controls. Use pheromone traps for early pest detection. Encourage beneficial insects like ladybugs and parasitic wasps. Neem-based pesticides are effective against aphids and caterpillars. Rotate pesticide classes to prevent resistance. Economic threshold: treat only when pest population exceeds damage threshold.',
    category: 'pest_control',
    keywords: ['IPM', 'integrated pest management', 'biological control', 'pheromone traps', 'beneficial insects', 'neem', 'pesticide resistance']
  },
  {
    id: 'weather_monsoon_1',
    title: 'Monsoon Weather Patterns and Crop Planning',
    content: 'Southwest monsoon (June-September) brings 70-80% of annual rainfall. Plan kharif crops (rice, cotton, sugarcane) during this period. Northeast monsoon (October-December) supports rabi crops (wheat, barley, chickpea). Use weather forecasts for irrigation scheduling. Extreme weather events are increasing - consider climate-resilient varieties.',
    category: 'weather',
    keywords: ['monsoon', 'kharif', 'rabi', 'rainfall', 'weather forecast', 'climate resilient', 'seasonal planning']
  },
  {
    id: 'market_prices_1',
    title: 'Agricultural Market Price Trends and MSP',
    content: 'Minimum Support Price (MSP) provides price security for farmers. Check current MSP rates on government portals. Market prices fluctuate based on supply-demand, weather, and global trends. Use e-NAM platform for better price discovery. Post-harvest storage and value addition can increase farmer income by 15-25%.',
    category: 'market_prices',
    keywords: ['MSP', 'minimum support price', 'market prices', 'e-NAM', 'price discovery', 'post-harvest', 'value addition']
  }
];

export class RAGService {
  private knowledgeBase: RAGDocument[];

  constructor() {
    this.knowledgeBase = AGRICULTURAL_KNOWLEDGE_BASE;
  }

  /**
   * Retrieve relevant documents based on user query
   * Uses simple keyword matching - in production, use vector embeddings
   */
  async retrieveRelevantDocs(query: string, maxResults: number = 3): Promise<string> {
    const queryLower = query.toLowerCase();
    const searchTerms = this.extractSearchTerms(queryLower);

    // Score documents based on keyword matches
    const scoredDocs = this.knowledgeBase.map(doc => {
      let score = 0;
      
      // Check title matches (higher weight)
      if (doc.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // Check keyword matches
      doc.keywords.forEach(keyword => {
        if (queryLower.includes(keyword.toLowerCase())) {
          score += 5;
        }
      });
      
      // Check content matches
      searchTerms.forEach(term => {
        if (doc.content.toLowerCase().includes(term)) {
          score += 2;
        }
      });
      
      // Category-specific boosting
      if (this.getCategoryFromQuery(queryLower) === doc.category) {
        score += 3;
      }

      return { ...doc, relevanceScore: score };
    });

    // Sort by relevance and take top results
    const relevantDocs = scoredDocs
      .filter(doc => doc.relevanceScore! > 0)
      .sort((a, b) => b.relevanceScore! - a.relevanceScore!)
      .slice(0, maxResults);

    if (relevantDocs.length === 0) {
      return "No specific agricultural knowledge found for this query. Using general agricultural expertise.";
    }

    // Format the retrieved context
    const contextParts = relevantDocs.map(doc => 
      `**${doc.title}**\n${doc.content}\n`
    );

    return `AGRICULTURAL KNOWLEDGE CONTEXT:\n${contextParts.join('\n')}`;
  }

  /**
   * Extract meaningful search terms from query
   */
  private extractSearchTerms(query: string): string[] {
    // Remove common stop words and extract meaningful terms
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by'];
    const words = query.split(/\s+/).filter(word => 
      word.length > 2 && !stopWords.includes(word.toLowerCase())
    );
    return words;
  }

  /**
   * Determine document category from query context
   */
  private getCategoryFromQuery(query: string): string {
    const categoryKeywords = {
      'crop_management': ['crop', 'planting', 'harvesting', 'rotation', 'variety'],
      'pest_control': ['pest', 'insect', 'disease', 'fungus', 'spray', 'control'],
      'soil_health': ['soil', 'ph', 'organic', 'compost', 'erosion'],
      'weather': ['weather', 'rain', 'temperature', 'climate', 'monsoon'],
      'market_prices': ['price', 'market', 'sell', 'msp', 'cost', 'profit'],
      'fertilizers': ['fertilizer', 'npk', 'nitrogen', 'phosphorus', 'potassium', 'urea'],
      'irrigation': ['water', 'irrigation', 'moisture', 'drip', 'sprinkler']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return category;
      }
    }

    return 'crop_management'; // default category
  }

  /**
   * Add new document to knowledge base (for dynamic updates)
   */
  addDocument(doc: Omit<RAGDocument, 'id'>): void {
    const newDoc: RAGDocument = {
      ...doc,
      id: `custom_${Date.now()}`
    };
    this.knowledgeBase.push(newDoc);
  }

  /**
   * Check if query contains search trigger words
   */
  static containsSearchTriggers(query: string): boolean {
    const searchTriggers = [
      'search', 'find', 'lookup', 'what is', 'what are', 'tell me about',
      'current price', 'latest', 'recent', 'today', 'now', 'predict',
      'forecast', 'market rate', 'news about', 'information on'
    ];
    
    const queryLower = query.toLowerCase();
    return searchTriggers.some(trigger => queryLower.includes(trigger));
  }

  /**
   * Get sensor-specific context for RAG
   */
  getSensorContext(sensorData: any): string {
    const { soilMoisture, npkNitrogen, npkPhosphorus, npkPotassium, humidity, locationName } = sensorData;
    
    let context = `CURRENT SENSOR READINGS:\n`;
    context += `Location: ${locationName}\n`;
    context += `Soil Moisture: ${soilMoisture}% (${this.getMoistureStatus(soilMoisture)})\n`;
    context += `NPK Levels: N=${npkNitrogen}ppm, P=${npkPhosphorus}ppm, K=${npkPotassium}ppm\n`;
    context += `Humidity: ${humidity}%\n\n`;
    
    // Add contextual recommendations based on sensor readings
    if (soilMoisture < 40) {
      context += `ALERT: Low soil moisture detected. Consider irrigation.\n`;
    }
    if (soilMoisture > 80) {
      context += `ALERT: High soil moisture detected. Check drainage.\n`;
    }
    
    const avgNPK = (npkNitrogen + npkPhosphorus + npkPotassium) / 3;
    if (avgNPK < 50) {
      context += `ALERT: Low NPK levels detected. Consider fertilizer application.\n`;
    }
    
    return context;
  }

  private getMoistureStatus(moisture: number): string {
    if (moisture < 20) return 'Very Dry - Immediate irrigation needed';
    if (moisture < 40) return 'Dry - Irrigation recommended';
    if (moisture < 60) return 'Moderate - Monitor closely';
    if (moisture < 80) return 'Good - Optimal range';
    return 'Very Wet - Check drainage';
  }
}

// Export singleton instance
export const ragService = new RAGService();