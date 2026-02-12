// cspell:ignore THINGSPEAK
import { ThingSpeakResponse } from './thingspeak';

export interface VitalStatsData {
    red: number;
    nir: number;
    ndvi: number;
    ratio: number;
    chlorophyll: number;
    nitrogen: number;
    time: string;
}

const getResultCount = (range: string): number => {
    const counts = {
        '1h': 60,
        '24h': 144,
        '7d': 168,
        '30d': 720,
        '1y': 8760
    };
    return counts[range as keyof typeof counts] || 144;
};

const parseNumericValue = (value: string | null | undefined, fallback: number = 0): number => {
    if (!value || value.trim() === '') return fallback;
    const parsed = parseFloat(value.trim());
    return isNaN(parsed) ? fallback : parsed;
};

export async function fetchVitalStats(timeRange: string = '24h'): Promise<VitalStatsData[]> {
    try {
        console.log(`Fetching Vital Stats for range: ${timeRange}`);

        const channelId = process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID_2;
        const apiKey = process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY_2;

        if (!channelId || !apiKey) {
            console.error('ThingSpeak configuration missing for Vital Stats');
            throw new Error('ThingSpeak configuration missing for Vital Stats (Channel 2). Please check NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID_2 and NEXT_PUBLIC_THINGSPEAK_READ_API_KEY_2.');
        }

        const resultsCount = getResultCount(timeRange);
        const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${resultsCount}`;

        console.log('ThingSpeak Vital Stats URL:', url.replace(apiKey, '***HIDDEN***'));

        const response = await fetch(url, {
            next: { revalidate: 30 }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Vital Stats: ${response.status}`);
        }

        const data: ThingSpeakResponse = await response.json();

        if (!data.feeds || data.feeds.length === 0) {
            return [];
        }

        const processedData = data.feeds.map(feed => ({
            red: parseNumericValue(feed.field1),
            nir: parseNumericValue(feed.field2),
            ndvi: parseNumericValue(feed.field3),
            ratio: parseNumericValue(feed.field4),
            chlorophyll: parseNumericValue(feed.field5),
            nitrogen: parseNumericValue(feed.field6),
            time: new Date(feed.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        }));

        return processedData;

    } catch (error) {
        console.error('Error fetching Vital Stats:', error);
        throw error;
    }
}
