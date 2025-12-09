export interface SoilMoistureData {
  soilMoisture: number;
  time: string;
}

export interface ThingSpeakData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  time: string;
}

export interface NPKData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  time: string;
}

export interface ThingSpeakResponse {
  feeds: Array<{
    created_at: string;
    field1: string; // soil moisture
    field2: string; // temperature
    field3: string; // humidity
    field5: string; // nitrogen (N)
    field6: string; // phosphorus (P)
    field7: string; // potassium (K)
  }>;
}

// Consistent result counts for all functions
const getResultCount = (range: string): number => {
  const counts = {
    '1h': 60,     // 1 minute intervals
    '24h': 144,   // 10 minute intervals  
    '7d': 168,    // 1 hour intervals
    '30d': 720,   // 1 hour intervals
    '1y': 8760    // 1 hour intervals
  };
  return counts[range as keyof typeof counts] || 144;
};

const getThingSpeakUrl = (range: string) => {
  const THINGSPEAK_CHANNEL_ID = process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID;
  const THINGSPEAK_API_KEY = process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY;

  if (!THINGSPEAK_CHANNEL_ID || !THINGSPEAK_API_KEY) {
    console.error('ThingSpeak configuration missing:', {
      channelId: THINGSPEAK_CHANNEL_ID ? 'present' : 'missing',
      apiKey: THINGSPEAK_API_KEY ? 'present' : 'missing'
    });
    throw new Error('ThingSpeak API configuration is missing. Please check NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID and NEXT_PUBLIC_THINGSPEAK_READ_API_KEY environment variables.');
  }

  const results = getResultCount(range);
  const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=${results}`;
  
  console.log('ThingSpeak URL:', url.replace(THINGSPEAK_API_KEY, '***HIDDEN***'));
  return url;
};

const parseNumericValue = (value: string | null | undefined, fallback: number = 0): number => {
  if (!value || value.trim() === '') return fallback;
  const parsed = parseFloat(value.trim());
  return isNaN(parsed) ? fallback : parsed;
};

const calculateTrend = (current: number, previous: number): { change: number; increasing: boolean } => {
  if (previous === 0) return { change: 0, increasing: false };
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return {
    change: Math.abs(parseFloat(change.toFixed(1))),
    increasing: change > 0
  };
};

export const fetchSoilMoistureData = async (range: string = '24h'): Promise<{
  currentData: SoilMoistureData;
  historyData: ThingSpeakData[];
  trend: { change: number; increasing: boolean };
}> => {
  try {
    console.log(`Fetching soil moisture data for range: ${range}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout to 10s

    const response = await fetch(getThingSpeakUrl(range), {
      signal: controller.signal,
      next: { revalidate: 30 } // Cache for 30 seconds
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ThingSpeak API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`ThingSpeak API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('ThingSpeak raw response:', data);
    
    const feeds = data.feeds as ThingSpeakResponse['feeds'];
    
    if (!feeds || feeds.length === 0) {
      console.warn('No feeds data available from ThingSpeak');
      throw new Error('No data available from ThingSpeak. The channel might be empty or the API key might be invalid.');
    }

    console.log(`Received ${feeds.length} feeds from ThingSpeak`);

    // Get latest readings
    const latest = feeds[feeds.length - 1];
    const previous = feeds[feeds.length - 2] || latest;

    console.log('Latest feed:', latest);
    console.log('Previous feed:', previous);

    // Convert string values to numbers with proper validation
    const currentSoilMoisture = parseNumericValue(latest.field1);
    const previousSoilMoisture = parseNumericValue(previous.field1);

    console.log('Parsed values:', {
      currentSoilMoisture,
      previousSoilMoisture,
      rawField1: latest.field1,
      rawField2: latest.field2,
      rawField3: latest.field3
    });

    // Process history data with validation
    const historyData = feeds.map((feed, index) => ({
      time: new Date(feed.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      soilMoisture: parseNumericValue(feed.field1),
      temperature: parseNumericValue(feed.field2),
      humidity: parseNumericValue(feed.field3)
    }));

    const result = {
      currentData: {
        time: new Date(latest.created_at).toLocaleTimeString(),
        soilMoisture: currentSoilMoisture
      },
      historyData,
      trend: calculateTrend(currentSoilMoisture, previousSoilMoisture)
    };

    console.log('Processed result:', result);
    return result;

  } catch (error) {
    console.error('Error fetching soil moisture data:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('ThingSpeak API request timed out after 10 seconds');
      }
      throw error;
    }
    throw new Error('Unknown error occurred while fetching ThingSpeak data');
  }
};

export async function fetchThingSpeakHistory(timeRange: string = '24h'): Promise<ThingSpeakData[]> {
  try {
    console.log(`Fetching ThingSpeak history for range: ${timeRange}`);
    
    const channelId = process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID;
    const apiKey = process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY;
    
    if (!channelId || !apiKey) {
      console.error('ThingSpeak configuration missing in fetchThingSpeakHistory');
      throw new Error('ThingSpeak configuration missing. Please check environment variables.');
    }

    const resultsCount = getResultCount(timeRange);
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${resultsCount}`;
    
    console.log('ThingSpeak history URL:', url.replace(apiKey, '***HIDDEN***'));

    const response = await fetch(url, {
      next: { revalidate: 30 } // Cache for 30 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ThingSpeak history API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch ThingSpeak data: ${response.status} - ${response.statusText}`);
    }

    const data: ThingSpeakResponse = await response.json();
    console.log('ThingSpeak history response:', data);
    
    if (!data.feeds || data.feeds.length === 0) {
      console.warn('No feeds data in ThingSpeak history response');
      return [];
    }

    const processedData = data.feeds.map(feed => ({
      soilMoisture: parseNumericValue(feed.field1),
      temperature: parseNumericValue(feed.field2),
      humidity: parseNumericValue(feed.field3),
      time: new Date(feed.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }));

    console.log(`Processed ${processedData.length} history records`);
    return processedData;

  } catch (error) {
    console.error('Error fetching ThingSpeak history:', error);
    throw error;
  }
}

export async function fetchNPKData(timeRange: string = '24h'): Promise<NPKData[]> {
  try {
    console.log(`Fetching NPK data for range: ${timeRange}`);
    
    const channelId = process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID;
    const apiKey = process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY;
    
    if (!channelId || !apiKey) {
      console.error('ThingSpeak configuration missing in fetchNPKData');
      throw new Error('ThingSpeak configuration missing. Please check environment variables.');
    }

    const resultsCount = getResultCount(timeRange);
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${resultsCount}`;
    
    console.log('ThingSpeak NPK URL:', url.replace(apiKey, '***HIDDEN***'));

    const response = await fetch(url, {
      next: { revalidate: 30 } // Cache for 30 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ThingSpeak NPK API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch NPK data: ${response.status} - ${response.statusText}`);
    }

    const data: ThingSpeakResponse = await response.json();
    console.log('ThingSpeak NPK response:', data);
    
    if (!data.feeds || data.feeds.length === 0) {
      console.warn('No feeds data in ThingSpeak NPK response');
      return [];
    }

    const processedData = data.feeds.map(feed => ({
      nitrogen: parseNumericValue(feed.field5),
      phosphorus: parseNumericValue(feed.field6),
      potassium: parseNumericValue(feed.field7),
      time: new Date(feed.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }));

    console.log(`Processed ${processedData.length} NPK records`);
    return processedData;

  } catch (error) {
    console.error('Error fetching NPK data:', error);
    throw error;
  }
}

export async function fetchCurrentNPK(): Promise<{
  currentData: NPKData;
  trend: { change: number; increasing: boolean };
}> {
  try {
    console.log('Fetching current NPK data');
    
    const npkHistory = await fetchNPKData('24h');
    
    if (npkHistory.length === 0) {
      throw new Error('No NPK data available');
    }

    // Get latest readings
    const latest = npkHistory[npkHistory.length - 1];
    const previous = npkHistory[npkHistory.length - 2] || latest;

    // Calculate average trend across all three nutrients
    const currentAvg = (latest.nitrogen + latest.phosphorus + latest.potassium) / 3;
    const previousAvg = (previous.nitrogen + previous.phosphorus + previous.potassium) / 3;
    
    const trend = calculateTrend(currentAvg, previousAvg);

    return {
      currentData: latest,
      trend
    };

  } catch (error) {
    console.error('Error fetching current NPK data:', error);
    throw error;
  }
}

export async function fetchLatestSensorData(): Promise<ThingSpeakResponse['feeds'][0] | null> {
  try {
    const THINGSPEAK_CHANNEL_ID = process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID;
    const THINGSPEAK_API_KEY = process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY;

    if (!THINGSPEAK_CHANNEL_ID || !THINGSPEAK_API_KEY) {
      console.error('ThingSpeak configuration missing');
      return null;
    }

    const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ThingSpeak API error: ${response.status}`);
    }

    const data: ThingSpeakResponse = await response.json();
    
    if (!data.feeds || data.feeds.length === 0) {
      console.warn('No sensor data available');
      return null;
    }

    return data.feeds[0];

  } catch (error) {
    console.error('Error fetching latest sensor data:', error);
    return null;
  }
}