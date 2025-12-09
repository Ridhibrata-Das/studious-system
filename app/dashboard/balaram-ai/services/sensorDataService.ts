// Sensor Data Service - Consolidates all sensor data fetching for GeminiWebSocket
// This service fetches data from ThingSpeak, Open-Meteo, and other APIs

import { ThingSpeakResponse } from '@/lib/thingspeak';

// API Keys and Configuration
const THINGSPEAK_CHANNEL_ID = process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID;
const THINGSPEAK_API_KEY = process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY;
const OPENCAGE_API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;

// Interfaces
export interface WeatherData {
  temperature: number;
  humidity: number;
  time: string;
}

export interface SoilMoistureData {
  soilMoisture: number;
  time: string;
}

export interface NPKData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  time: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  locationName: string;
}

export interface SensorData {
  location: LocationData;
  weather: WeatherData;
  soilMoisture: SoilMoistureData;
  npk: NPKData;
}

// Shape matching what dashboard uses and what Gemini needs inline
export interface GeminiVariables {
  locationName: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  npkNitrogen: number;
  npkPhosphorus: number;
  npkPotassium: number;
  npkAverage: number;
}

// Current sensor data storage
let currentSensorData: SensorData = {
  location: {
    latitude: 22.5626,
    longitude: 88.363,
    locationName: 'Default Location'
  },
  weather: {
    temperature: 0,
    humidity: 0,
    time: ''
  },
  soilMoisture: {
    soilMoisture: 0,
    time: ''
  },
  npk: {
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    time: ''
  }
};

// Function to update sensor data
export function updateSensorData(data: Partial<SensorData>) {
  currentSensorData = { ...currentSensorData, ...data };
}

// Function to get current sensor data
export function getCurrentSensorData(): SensorData {
  return currentSensorData;
}

// Returns variables in the same way dashboard renders them, for Gemini
export function getGeminiVariables(): GeminiVariables {
  const data = getCurrentSensorData();
  const avg = (data.npk.nitrogen + data.npk.phosphorus + data.npk.potassium) / 3;
  return {
    locationName: data.location.locationName,
    temperature: data.weather.temperature,
    humidity: data.weather.humidity,
    soilMoisture: data.soilMoisture.soilMoisture,
    npkNitrogen: data.npk.nitrogen,
    npkPhosphorus: data.npk.phosphorus,
    npkPotassium: data.npk.potassium,
    npkAverage: avg,
  };
}

// Weather API functions
export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    const current = data.current;
    
    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      time: current.time
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      temperature: 0,
      humidity: 0,
      time: new Date().toISOString()
    };
  }
}

// ThingSpeak API functions
export async function fetchSoilMoistureData(timeRange: string = '24h'): Promise<{
  currentData: SoilMoistureData;
  historyData: any[];
  trend: { change: number; increasing: boolean };
}> {
  if (!THINGSPEAK_CHANNEL_ID || !THINGSPEAK_API_KEY) {
    console.error('ThingSpeak credentials not configured');
    return {
      currentData: { soilMoisture: 0, time: new Date().toISOString() },
      historyData: [],
      trend: { change: 0, increasing: true }
    };
  }

  try {
    const results = getResultCount(timeRange);
    const response = await fetch(
      `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=${results}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error(`ThingSpeak API error: ${response.status}`);
    }

    const data = await response.json();
    const feeds = data.feeds || [];
    
    if (feeds.length === 0) {
      throw new Error('No data received from ThingSpeak');
    }

    const currentFeed = feeds[feeds.length - 1];
    const currentData: SoilMoistureData = {
      soilMoisture: parseNumericValue(currentFeed.field1),
      time: currentFeed.created_at
    };

    // Calculate trend
    const trend = calculateTrend(feeds, 'field1');
    
    return {
      currentData,
      historyData: feeds,
      trend
    };
  } catch (error) {
    console.error('Error fetching soil moisture data:', error);
    return {
      currentData: { soilMoisture: 0, time: new Date().toISOString() },
      historyData: [],
      trend: { change: 0, increasing: true }
    };
  }
}

export async function fetchNPKData(timeRange: string = '24h'): Promise<NPKData[]> {
  if (!THINGSPEAK_CHANNEL_ID || !THINGSPEAK_API_KEY) {
    console.error('ThingSpeak credentials not configured');
    return [];
  }

  try {
    const results = getResultCount(timeRange);
    const response = await fetch(
      `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=${results}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error(`ThingSpeak API error: ${response.status}`);
    }

    const data: ThingSpeakResponse = await response.json();
    const feeds = data.feeds || [];
    
    return feeds.map((feed: ThingSpeakResponse['feeds'][0]) => ({
      nitrogen: parseNumericValue(feed.field5),
      phosphorus: parseNumericValue(feed.field6),
      potassium: parseNumericValue(feed.field7),
      time: feed.created_at
    }));
  } catch (error) {
    console.error('Error fetching NPK data:', error);
    return [];
  }
}

export async function fetchCurrentNPK(): Promise<{
  currentData: NPKData;
  trend: { change: number; increasing: boolean };
}> {
  try {
    const npkHistory = await fetchNPKData('24h');
    if (npkHistory.length === 0) {
      return {
        currentData: { nitrogen: 0, phosphorus: 0, potassium: 0, time: new Date().toISOString() },
        trend: { change: 0, increasing: true }
      };
    }

    const currentData = npkHistory[npkHistory.length - 1];
    const average = (currentData.nitrogen + currentData.phosphorus + currentData.potassium) / 3;
    
    // Calculate trend based on average NPK values
    const trend = calculateTrend(npkHistory.map(item => ({ 
      field1: ((item.nitrogen + item.phosphorus + item.potassium) / 3).toString() 
    })), 'field1');

    return { currentData, trend };
  } catch (error) {
    console.error('Error fetching current NPK:', error);
    return {
      currentData: { nitrogen: 0, phosphorus: 0, potassium: 0, time: new Date().toISOString() },
      trend: { change: 0, increasing: true }
    };
  }
}

// Location functions
export async function getLocationName(latitude: number, longitude: number): Promise<string> {
  if (!OPENCAGE_API_KEY) {
    return `Coordinates: ${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`;
  }

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}&language=en`
    );

    if (!response.ok) {
      throw new Error(`OpenCage API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results;

    if (results && results.length > 0) {
      const result = results[0];
      const components = result.components;
      
      // Validate location proximity
      const resultLat = result.geometry.lat;
      const resultLng = result.geometry.lng;
      const distance = Math.sqrt(
        Math.pow(latitude - resultLat, 2) + Math.pow(longitude - resultLng, 2)
      );

      if (distance > 0.01) { // More than ~1km
        return `Coordinates: ${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`;
      }

      // Build location name
      const parts = [];
      if (components.city) parts.push(components.city);
      if (components.state) parts.push(components.state);
      if (components.country) parts.push(components.country);

      return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
    }

    return 'Location Name Unavailable';
  } catch (error) {
    console.error('Error getting location name:', error);
    return `Coordinates: ${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`;
  }
}

// Utility functions
function getResultCount(range: string): number {
  const counts = {
    '1h': 60,     // 1 minute intervals
    '24h': 144,   // 10 minute intervals  
    '7d': 168,    // 1 hour intervals
    '30d': 720,   // 1 hour intervals
    '1y': 8760    // 1 hour intervals
  };
  return counts[range as keyof typeof counts] || 144;
}

function parseNumericValue(value: string | null | undefined, fallback: number = 0): number {
  if (!value || value.trim() === '') return fallback;
  const parsed = parseFloat(value.trim());
  return isNaN(parsed) ? fallback : parsed;
}

function calculateTrend(feeds: any[], fieldKey: string): { change: number; increasing: boolean } {
  if (feeds.length < 2) {
    return { change: 0, increasing: true };
  }

  const recent = parseNumericValue(feeds[feeds.length - 1][fieldKey]);
  const previous = parseNumericValue(feeds[feeds.length - 2][fieldKey]);
  const change = recent - previous;
  
  return {
    change: Math.abs(change),
    increasing: change > 0
  };
}

// Function to refresh all sensor data
export async function refreshAllSensorData(): Promise<SensorData> {
  try {
    // Get current location
    const location = currentSensorData.location;
    
    // Fetch all data in parallel
    const [weather, soilMoisture, currentNPK] = await Promise.all([
      fetchWeatherData(location.latitude, location.longitude),
      fetchSoilMoistureData('24h'),
      fetchCurrentNPK()
    ]);

    // Update current sensor data
    const newSensorData: SensorData = {
      location,
      weather,
      soilMoisture: soilMoisture.currentData,
      npk: currentNPK.currentData
    };

    updateSensorData(newSensorData);
    return newSensorData;
  } catch (error) {
    console.error('Error refreshing sensor data:', error);
    return currentSensorData;
  }
}

// Convenience function: set location and refresh to keep parity with dashboard flow
export async function refreshWithLocation(latitude: number, longitude: number, locationName?: string): Promise<SensorData> {
  currentSensorData.location = {
    latitude,
    longitude,
    locationName: locationName || currentSensorData.location.locationName,
  };
  // Optionally resolve a nicer name
  if (!locationName) {
    const name = await getLocationName(latitude, longitude).catch(() => 'Unknown Location');
    currentSensorData.location.locationName = name;
  }
  return refreshAllSensorData();
}


// Function to get formatted sensor data for AI context
export function getFormattedSensorDataForAI(): string {
  const data = getCurrentSensorData();
  return `Location: ${data.location.locationName}, Humidity: ${data.weather.humidity}%, Soil Moisture: ${data.soilMoisture.soilMoisture}%, NPK: N=${data.npk.nitrogen}ppm, P=${data.npk.phosphorus}ppm, K=${data.npk.potassium}ppm`;
}
