'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchSoilMoistureData, fetchThingSpeakHistory, fetchNPKData, fetchCurrentNPK } from "@/lib/thingspeak";
import { fetchWeatherData, fetchEvapotranspirationData } from "@/lib/weather";
import type { EvapotranspirationData } from "@/lib/weather";
import { getAgricultureRecommendation, getActionColor, getActionIcon, getActionUrgency, getUrgencyColor, getUrgencyIcon } from "@/lib/agricultureService";
import type { SoilMoistureData, ThingSpeakData, NPKData } from "@/lib/thingspeak";
import type { WeatherData } from "@/lib/weather";
import type { AgricultureRecommendation } from "@/lib/agricultureService";
import { cn } from "@/lib/utils";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  Brush,
} from 'recharts';
import { 
  ArrowUp, 
  ArrowDown, 
  Droplets, 
  Thermometer, 
  Gauge,
  MapPin,
  Loader2,
  Sun
} from 'lucide-react';
import Link from 'next/link';
import { Brain, Activity, Calendar, Phone } from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const timeRanges = [
  { value: '1h', label: 'Last Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '1y', label: 'Last Year' }
];

const getMoistureStatus = (value: number) => {
  if (value > 80) return { color: 'bg-red-500', text: 'Danger: Too Wet' };
  if (value < 20) return { color: 'bg-red-500', text: 'Danger: Too Dry' };
  if (value >= 60 && value <= 80) return { color: 'bg-yellow-500', text: 'Moderate: Slightly Wet' };
  if (value >= 20 && value < 40) return { color: 'bg-yellow-500', text: 'Moderate: Slightly Dry' };
  return { color: 'bg-green-500', text: 'Good' };
};

interface SensorCardProps {
  title: string;
  value: string | number;
  unit: string;
  trend?: {
    change: number;
    increasing: boolean;
  };
}

const SensorCard = ({ title, value, unit, trend }: SensorCardProps) => {
  const isMoisture = title.toLowerCase().includes('moisture');
  const status = isMoisture ? getMoistureStatus(Number(value)) : null;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold">
              {typeof value === 'number' ? value.toFixed(1) : value}
              <span className="text-lg font-normal">{unit}</span>
            </p>
            {trend && (
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded text-sm",
                trend.increasing ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                {trend.increasing ? "↑" : "↓"} {trend.change.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        {isMoisture && status && (
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded text-white text-sm",
              status.color
            )}>
              {status.text}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default function DashboardPage() {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 0,
    humidity: 0,
    time: ''
  });
  const [soilMoistureData, setSoilMoistureData] = useState<SoilMoistureData>({
    soilMoisture: 0,
    time: ''
  });
  const [npkData, setNpkData] = useState<NPKData>({
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    time: ''
  });
  const [location, setLocation] = useState({
    latitude: 22.5626,
    longitude: 88.363,
    locationName: 'Default Location'
  });
  const [isLocating, setIsLocating] = useState(false);
  const [historyData, setHistoryData] = useState<ThingSpeakData[]>([]);
  const [npkHistoryData, setNpkHistoryData] = useState<NPKData[]>([]);
  const [selectedRange, setSelectedRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [soilMoistureTrend, setSoilMoistureTrend] = useState<{ change: number; increasing: boolean }>({
    change: 0,
    increasing: true
  });
  const [npkTrend, setNpkTrend] = useState<{ change: number; increasing: boolean }>({
    change: 0,
    increasing: true
  });
  const [agricultureRecommendation, setAgricultureRecommendation] = useState<AgricultureRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [etData, setEtData] = useState<EvapotranspirationData | null>(null);

  const fetchRecommendation = async () => {
    try {
      setRecommendationLoading(true);
      console.log('Fetching agriculture recommendation...');
      const recommendation = await getAgricultureRecommendation();
      if (recommendation) {
        console.log('Successfully received recommendation:', recommendation);
        setAgricultureRecommendation(recommendation);
      } else {
        console.warn('No recommendation received');
        setAgricultureRecommendation(null);
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      toast.error(`Failed to get recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch weather data based on location
      const weather = await fetchWeatherData(location.latitude, location.longitude);
      setWeatherData(weather);

      // Fetch soil moisture data
      const { currentData, historyData: history, trend } = await fetchSoilMoistureData(selectedRange);
      setSoilMoistureData(currentData);
      setHistoryData(history);
      setSoilMoistureTrend(trend);

      // Fetch NPK data
      const [npkHistory, currentNPK] = await Promise.all([
        fetchNPKData(selectedRange),
        fetchCurrentNPK()
      ]);
      setNpkHistoryData(npkHistory);
      setNpkData(currentNPK.currentData);
      setNpkTrend(currentNPK.trend);

      // Check soil moisture for alerts
      if (currentData.soilMoisture > 80 || currentData.soilMoisture < 20) {
        await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ soilMoisture: currentData.soilMoisture }),
        });

        toast.info(
          currentData.soilMoisture > 80 
            ? "Alert: Plant is drowning! SMS notification sent."
            : "Alert: Plants need water! SMS notification sent."
        );
      }
      // Fetch agriculture recommendation
      await fetchRecommendation();
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch sensor data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    try {
      // Clear previous location first
      setLocation({
        latitude: 0,
        longitude: 0,
        locationName: 'Detecting location...'
      });

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,        // Increased timeout
          maximumAge: 0          // Always get fresh position
        };

        // Force a fresh location reading
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('Raw browser geolocation:', {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: new Date(pos.timestamp).toISOString()
            });
            resolve(pos);
          },
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error('Please allow location access to get weather data for your area'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('Unable to detect your location. Please try again'));
                break;
              case error.TIMEOUT:
                reject(new Error('Location detection timed out. Please try again'));
                break;
              default:
                reject(new Error('Failed to detect location. Please try again'));
            }
          },
          options
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      console.log('Processed coordinates:', { latitude, longitude, accuracy });
      
      // Validate coordinates
      if (!isValidCoordinate(latitude, longitude)) {
        throw new Error('Invalid coordinates detected. Please try again.');
      }

      // Update location immediately with coordinates
      setLocation(prev => ({
        ...prev,
        latitude,
        longitude,
        locationName: `Coordinates: ${latitude.toFixed(6)}°, ${longitude.toFixed(6)}° (±${Math.round(accuracy)}m)`
      }));

      // Start parallel requests for weather and location name
      const [weather, locationName] = await Promise.all([
        fetchWeatherData(latitude, longitude),
        getLocationName(latitude, longitude)
      ]).catch(error => {
        console.error('Error in parallel requests:', error);
        return [null, null];
      });

      // Update weather if available
      if (weather) {
        setWeatherData(weather);
      }

      // Update location name if available
      if (locationName && locationName !== 'Location Name Unavailable' && locationName !== 'Unknown Location') {
        setLocation(prev => ({
          ...prev,
          locationName: `${locationName}\n(${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°)`
        }));
        toast.success(`Location detected with accuracy of ±${Math.round(accuracy)} meters`);
      } else {
        toast.info(`Using GPS coordinates (±${Math.round(accuracy)} meters accuracy)`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error(error instanceof Error ? error.message : 'Could not detect your location');
      
      // Reset location to indicate error
      setLocation({
        latitude: 0,
        longitude: 0,
        locationName: 'Location detection failed'
      });
    } finally {
      setIsLocating(false);
    }
  };

  // Helper function to validate coordinates
  const isValidCoordinate = (lat: number, lon: number): boolean => {
    return (
      !isNaN(lat) && 
      !isNaN(lon) && 
      lat >= -90 && 
      lat <= 90 && 
      lon >= -180 && 
      lon <= 180 &&
      lat !== 0 && 
      lon !== 0
    );
  };

  const getLocationName = async (lat: number, lon: number): Promise<string> => {
    if (!process.env.NEXT_PUBLIC_OPENCAGE_API_KEY) {
      console.error('OpenCage API key is missing');
      return 'Location Name Unavailable';
    }

    try {
      // Ensure coordinates are properly formatted
      const formattedLat = lat.toFixed(6);
      const formattedLon = lon.toFixed(6);
      
      const url = new URL('https://api.opencagedata.com/geocode/v1/json');
      url.searchParams.append('q', `${formattedLat}+${formattedLon}`);
      url.searchParams.append('key', process.env.NEXT_PUBLIC_OPENCAGE_API_KEY);
      url.searchParams.append('language', 'en');
      url.searchParams.append('no_annotations', '1');
      url.searchParams.append('limit', '1');
      url.searchParams.append('no_dedupe', '1');
      url.searchParams.append('no_record', '1');

      console.log('OpenCage API URL:', url.toString());

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OpenCage API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('OpenCage raw response:', data);
      
      if (data.status.code !== 200) {
        throw new Error(`OpenCage API error: ${data.status.message}`);
      }

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;
        
        // Verify the returned coordinates are close to our request
        const returnedLat = result.geometry.lat;
        const returnedLon = result.geometry.lng;
        const distance = calculateDistance(lat, lon, returnedLat, returnedLon);
        
        console.log('Distance from requested location:', distance.toFixed(2), 'km');
        
        if (distance > 1) { // If more than 1km away
          console.warn('OpenCage returned location too far from requested coordinates');
          return `Coordinates: ${formattedLat}°, ${formattedLon}°`;
        }
        
        // Build location string from components
        const parts = [];
        
        if (components.building) parts.push(components.building);
        if (components.house_number) parts.push(components.house_number);
        if (components.road) parts.push(components.road);
        if (components.neighbourhood) parts.push(components.neighbourhood);
        if (components.suburb) parts.push(components.suburb);
        if (components.city || components.town) parts.push(components.city || components.town);
        if (components.county) parts.push(components.county);
        if (components.state) parts.push(components.state);
        if (components.postcode) parts.push(components.postcode);
        if (components.country) parts.push(components.country);

        const locationString = parts.filter(Boolean).join(', ');
        console.log('Constructed location:', locationString);
        
        return locationString || `Coordinates: ${formattedLat}°, ${formattedLon}°`;
      }
      return `Coordinates: ${formattedLat}°, ${formattedLon}°`;
    } catch (error) {
      console.error('Error fetching location name:', error);
      return `Coordinates: ${lat.toFixed(6)}°, ${lon.toFixed(6)}°`;
    }
  };

  // Helper function to calculate distance between coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Separate useEffect for initial data fetch and polling
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch current weather data from OpenMeteo
        const weather = await fetchWeatherData(location.latitude, location.longitude);
        setWeatherData(weather);

      // Fetch ThingSpeak data (current and history) and ET in parallel
      const [thingSpeakHistory, soilMoistureResult, npkHistory, currentNPK, evapotranspiration] = await Promise.all([
        fetchThingSpeakHistory(selectedRange),
        fetchSoilMoistureData(selectedRange),
        fetchNPKData(selectedRange),
        fetchCurrentNPK(),
        fetchEvapotranspirationData(location.latitude, location.longitude)
      ]);

        setHistoryData(thingSpeakHistory);
        setSoilMoistureData(soilMoistureResult.currentData);
        setSoilMoistureTrend(soilMoistureResult.trend);
        setNpkHistoryData(npkHistory);
        setNpkData(currentNPK.currentData);
        setNpkTrend(currentNPK.trend);
      setEtData(evapotranspiration);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch sensor data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    
    // Set up polling interval based on selected range
    const interval = {
      '1h': 15000,   // 15 seconds
      '24h': 60000,  // 1 minute
      '7d': 300000,  // 5 minutes
      '30d': 900000, // 15 minutes
      '1y': 3600000  // 1 hour
    }[selectedRange] || 60000;

    const pollInterval = setInterval(fetchAllData, interval);
    return () => clearInterval(pollInterval);
  }, [selectedRange, location.latitude, location.longitude]);

  const renderGraph = (dataKey: keyof ThingSpeakData, data: ThingSpeakData[], color: string, unit: string) => (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {dataKey.charAt(0).toUpperCase() + dataKey.slice(1)} History
        </h2>
        <Select value={selectedRange} onValueChange={setSelectedRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={`${dataKey.charAt(0).toUpperCase() + dataKey.slice(1)} (${unit})`}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
            <Brush dataKey="time" height={30} stroke={color} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  const renderNPKGraph = (data: NPKData[], unit: string) => (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">NPK Sensor Data</h2>
        <Select value={selectedRange} onValueChange={setSelectedRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="nitrogen"
              name="Nitrogen (N)"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="phosphorus"
              name="Phosphorus (P)"
              stroke="#DC2626"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="potassium"
              name="Potassium (K)"
              stroke="#9333EA"
              strokeWidth={2}
              dot={false}
            />
            <Brush dataKey="time" height={30} stroke="#6B7280" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  // Helper to render generic ET-based charts
  const renderETGraph = (
    title: string,
    seriesKey: 'evaporation' | 'pet' | 'aet' | 'soilMoisture',
    color: string,
    unit: string
  ) => {
    // Build combined series from historical + forecast for smoother line
    const series = etData ? [
      ...etData.historical.map(d => ({
        time: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        evaporation: d.evaporation,
        pet: d.pet,
        aet: d.aet,
        soilMoisture: d.soilMoisture
      })),
      ...etData.forecast.map(d => ({
        time: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        evaporation: d.evaporation,
        pet: d.pet,
        aet: d.aet,
        soilMoisture: d.soilMoisture
      }))
    ] : [];

    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="text-sm text-gray-500">{location.locationName}</div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={seriesKey}
                name={`${title} (${unit})`}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  };

  const renderSensorCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <SensorCard
        title="Temperature"
        value={weatherData.temperature?.toFixed(1)}
        unit="°C"
      />
      <SensorCard
        title="Humidity"
        value={weatherData.humidity?.toFixed(1)}
        unit="%"
      />
      <SensorCard
        title="Soil Moisture"
        value={soilMoistureData.soilMoisture?.toFixed(1)}
        unit="%"
        trend={soilMoistureTrend}
      />
      <SensorCard
        title="NPK Average"
        value={((npkData.nitrogen + npkData.phosphorus + npkData.potassium) / 3).toFixed(1)}
        unit="ppm"
        trend={npkTrend}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header - e-bhoomi style */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-blue-600 rounded-xl p-6 text-white shadow-lg flex items-center justify-between min-h-[120px]">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-lg opacity-90 mt-2">Here's today's overview.</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{weatherData.temperature?.toFixed(1)}°C</div>
            <div className="opacity-90 mt-1">Updated {new Date().toLocaleTimeString()}</div>
            <div className="opacity-70 mt-1 flex items-center justify-end"><MapPin className="h-4 w-4 mr-1" />{location.locationName}</div>
          </div>
        </div>

        {/* Location Action */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={detectLocation}
            disabled={isLocating}
            className="flex items-center gap-2"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {isLocating ? 'Detecting Location...' : 'Detect Location'}
          </Button>
        </div>

        {/* Key Metrics - e-bhoomi styled cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Temperature', value: `${weatherData.temperature?.toFixed(1)}°C`, icon: Thermometer, color: 'blue', status: 'Current' },
            { label: 'Humidity', value: `${weatherData.humidity?.toFixed(1)}%`, icon: Droplets, color: 'green', status: 'Current' },
            { label: 'Soil Moisture', value: `${soilMoistureData.soilMoisture?.toFixed(1)}%`, icon: Gauge, color: 'purple', status: soilMoistureTrend.increasing ? 'Rising' : 'Falling' },
            { label: 'NPK Avg', value: `${((npkData.nitrogen + npkData.phosphorus + npkData.potassium) / 3).toFixed(1)} ppm`, icon: Sun, color: 'yellow', status: npkTrend.increasing ? 'Rising' : 'Falling' },
            { label: 'Range', value: timeRanges.find(r => r.value === selectedRange)?.label || 'Last 24 Hours', icon: Loader2, color: 'red', status: 'Charts' },
          ].map((m) => (
            <div key={m.label} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${m.color}-500`}>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm opacity-70">{m.label}</p>
                  <div className="text-2xl font-bold">{m.value}</div>
                  <p className="text-xs opacity-70 mt-1">{m.status}</p>
                </div>
                <m.icon className={`h-8 w-8 text-${m.color}-500`} />
              </div>
            </div>
          ))}
        </div>

        {/* Action Suggestion Card */}
        {agricultureRecommendation && (
          <Card className={`p-6 mb-6 border-2 ${getUrgencyColor(getActionUrgency(agricultureRecommendation.action))}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getUrgencyIcon(getActionUrgency(agricultureRecommendation.action))}</span>
                <div>
                  <h3 className="text-xl font-bold">Action Suggested</h3>
                  <p className="text-sm opacity-75">Based on current sensor readings</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getActionColor(agricultureRecommendation.action)}`}>
                  {getActionIcon(agricultureRecommendation.action)} {agricultureRecommendation.action}
                </div>
                <p className="text-xs mt-1 opacity-75">
                  Confidence: {Math.round(agricultureRecommendation.confidence * 100)}%
                </p>
              </div>
            </div>
            
            <div className="bg-white/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">Analysis</h4>
                  <p className="text-sm">{agricultureRecommendation.semantic_tag}</p>
                </div>
                <div className="text-right">
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      NDI: {agricultureRecommendation.ndi_label}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      PDI: {agricultureRecommendation.pdi_label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {recommendationLoading && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Analyzing sensor data for recommendations...</span>
            </div>
          </Card>
        )}

        {/* Graphs Section - e-bhoomi overview style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* NPK, Temperature, Humidity */}
          {renderNPKGraph(npkHistoryData, 'ppm')}
          {renderGraph('temperature', historyData, '#2563EB', '°C')}
          {renderGraph('humidity', historyData, '#16A34A', '%')}
        </div>

        {/* ET Graphs: Evaporation, Evapotranspiration, Soil Moisture */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderETGraph('Evaporation', 'evaporation', '#9333EA', 'mm/day')}
          {renderETGraph('Evapotranspiration (AET)', 'aet', '#0EA5E9', 'mm/day')}
          {renderETGraph('Soil Moisture', 'soilMoisture', '#F59E0B', '%')}
        </div>

        {/* Quick Actions - e-bhoomi style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/dashboard/balaram-ai" className="p-4 bg-green-600 text-white rounded-xl text-center hover:bg-green-700">
            <Brain className="h-8 w-8 mx-auto mb-2" />
            <div>Ask Balaram AI</div>
          </Link>
          <Link href="/dashboard/sensors" className="p-4 bg-blue-600 text-white rounded-xl text-center hover:bg-blue-700">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <div>Sensors</div>
          </Link>
          <Link href="/dashboard/alerts" className="p-4 bg-red-600 text-white rounded-xl text-center hover:bg-red-700">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <div>Alerts</div>
          </Link>
          <button
            onClick={async () => {
              const input = window.prompt('Enter 10-digit phone number (India):');
              if (!input) return;
              const digitsOnly = input.replace(/\D/g, '');
              if (digitsOnly.length !== 10) {
                toast.error('Please enter a valid 10-digit number');
                return;
              }
              const e164 = `+91${digitsOnly}`;
              const res = await fetch('/api/omnidim/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: e164,
                  call_context: {
                    customer_name: 'Dashboard User',
                    account_id: 'DASH-TEST-001',
                    priority: 'high'
                  }
                })
              });
              if (res.ok) {
                toast.success('AI call initiated');
              } else {
                const msg = await res.json().catch(() => ({}));
                toast.error(msg?.error || 'Failed to start call');
              }
            }}
            className="p-4 bg-orange-600 text-white rounded-xl text-center hover:bg-orange-700"
          >
            <Phone className="h-8 w-8 mx-auto mb-2" />
            <div>Schedule</div>
          </button>
        </div>


        {/* Bottom placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6"><h3 className="text-lg font-semibold mb-2">Yield Projection</h3><p className="text-sm text-gray-500">Coming soon</p></Card>
          <Card className="p-6"><h3 className="text-lg font-semibold mb-2">Crop Health</h3><p className="text-sm text-gray-500">Coming soon</p></Card>
        </div>


        {/* ElevenLabs Widget (call button removed to keep single CTA) */}
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
            <div className="w-full">
              <elevenlabs-convai agent-id="E7uRv9f5EFaBZCh3KN50"></elevenlabs-convai>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}