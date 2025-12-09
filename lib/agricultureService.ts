import { fetchLatestSensorData } from '@/lib/thingspeak';

export interface AgricultureRecommendation {
  action: string;
  semantic_tag: string;
  ndi_label: string;
  pdi_label: string;
  confidence: number;
  score: number;
  matched_record?: any;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  n: number;
  p: number;
  k: number;
}

export async function getAgricultureRecommendation(): Promise<AgricultureRecommendation | null> {
  try {
    // Fetch latest sensor data
    const sensorData = await fetchLatestSensorData();
    
    if (!sensorData) {
      console.warn('No sensor data available for recommendation');
      return null;
    }

    // Extract NPK data (assuming it's in fields 5, 6, 7 as per previous setup)
    const n = parseFloat(sensorData.field5) || 0;
    const p = parseFloat(sensorData.field6) || 0;
    const k = parseFloat(sensorData.field7) || 0;
    const temperature = parseFloat(sensorData.field2) || 0; // field2 is temperature
    const humidity = parseFloat(sensorData.field3) || 0; // field3 is humidity
    const soil_moisture = parseFloat(sensorData.field1) || 0; // field1 is soil moisture

    console.log('Sending sensor data for recommendation:', { n, p, k, temperature, humidity, soil_moisture });

    // Call the recommendation API
    const response = await fetch('/api/ml/agriculture/recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        n,
        p,
        k,
        temperature,
        humidity,
        soil_moisture
      }),
    });

    console.log('Recommendation API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Recommendation API error:', error);
      throw new Error(error.error || 'Failed to get recommendation');
    }

    const recommendation = await response.json();
    console.log('Received recommendation:', recommendation);
    return recommendation;

  } catch (error) {
    console.error('Error getting agriculture recommendation:', error);
    return null;
  }
}

export async function getAgricultureStatistics() {
  try {
    console.log('Fetching agriculture statistics...');
    const response = await fetch('/api/ml/agriculture/recommendation?type=statistics');
    
    console.log('Statistics API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Statistics API error:', errorText);
      throw new Error(`Failed to fetch statistics: ${errorText}`);
    }

    const data = await response.json();
    console.log('Received statistics:', data);
    return data;
  } catch (error) {
    console.error('Error fetching agriculture statistics:', error);
    return null;
  }
}

export async function getNPKRanges() {
  try {
    const response = await fetch('/api/ml/agriculture/recommendation?type=npk-ranges');
    
    if (!response.ok) {
      throw new Error('Failed to fetch NPK ranges');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching NPK ranges:', error);
    return null;
  }
}

export function getActionColor(action: string): string {
  const actionColors: { [key: string]: string } = {
    'Apply Fertilizer': 'bg-green-100 text-green-800 border-green-200',
    'Apply Pesticide': 'bg-red-100 text-red-800 border-red-200',
    'Irrigate': 'bg-blue-100 text-blue-800 border-blue-200',
    'Monitor': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'default': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  return actionColors[action] || actionColors.default;
}

export function getActionUrgency(action: string): 'urgent' | 'moderate' | 'good' {
  const urgencyMap: { [key: string]: 'urgent' | 'moderate' | 'good' } = {
    'Apply Pesticide': 'urgent',    // Red - Immediate action needed
    'Irrigate': 'urgent',           // Red - Critical for plant survival
    'Apply Fertilizer': 'moderate', // Yellow - Important but not immediate
    'Monitor': 'good',              // Green - Just monitoring needed
  };
  
  return urgencyMap[action] || 'good';
}

export function getUrgencyColor(urgency: 'urgent' | 'moderate' | 'good'): string {
  const colors = {
    urgent: 'bg-red-50 border-red-200 text-red-800',
    moderate: 'bg-yellow-50 border-yellow-200 text-yellow-800', 
    good: 'bg-green-50 border-green-200 text-green-800'
  };
  
  return colors[urgency];
}

export function getUrgencyIcon(urgency: 'urgent' | 'moderate' | 'good'): string {
  const icons = {
    urgent: '🚨',
    moderate: '⚠️',
    good: '✅'
  };
  
  return icons[urgency];
}

export function getActionIcon(action: string): string {
  const actionIcons: { [key: string]: string } = {
    'Apply Fertilizer': '🌱',
    'Apply Pesticide': '🛡️',
    'Irrigate': '💧',
    'Monitor': '👁️',
    'default': '📊'
  };
  
  return actionIcons[action] || actionIcons.default;
}
