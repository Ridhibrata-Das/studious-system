"use client";
import { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Thermometer,
  Loader2,
  RefreshCw,
  MapPin,
  Waves,
  Leaf,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { fetchDetailedWeatherData } from "@/lib/weather";
import type { DetailedWeatherData } from "@/lib/weather";
import { toast } from "sonner";

const iconMap = {
  Sun: Sun,
  Cloud: Cloud,
  CloudRain: CloudRain,
};

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<DetailedWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({
    latitude: 22.5626,
    longitude: 88.363,
    locationName: 'Kolkata, India'
  });

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const data = await fetchDetailedWeatherData(location.latitude, location.longitude);
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast.error('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Simple location name (you can enhance this with reverse geocoding)
      setLocation({
        latitude,
        longitude,
        locationName: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
      });
      
      toast.success('Location detected successfully');
    } catch (error) {
      console.error('Error detecting location:', error);
      toast.error('Failed to detect location');
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  if (loading && !weatherData) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading weather data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Weather Intelligence</h1>
              <p className="text-blue-100 mt-1">
                Real-time weather data and agricultural forecasts
              </p>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm text-blue-200">{location.locationName}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={detectLocation}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-3 py-2 rounded-lg text-sm"
              >
                <MapPin className="h-4 w-4 mr-2 inline" />
                Detect Location
              </button>
              <button
                onClick={fetchWeather}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-3 py-2 rounded-lg text-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2 inline" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Current Weather */}
        {weatherData && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {weatherData.current.temperature}°C
                </h2>
                <p className="text-xl text-blue-100 mb-4">
                  {weatherData.current.condition}
                </p>
                <p className="text-blue-100">
                  Feels like {weatherData.current.feelsLike}°C
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                  <p className="text-sm text-blue-200">Humidity</p>
                  <p className="text-xl font-bold">
                    {weatherData.current.humidity}%
                  </p>
                </div>
                <div className="text-center">
                  <Wind className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                  <p className="text-sm text-blue-200">Wind Speed</p>
                  <p className="text-xl font-bold">
                    {weatherData.current.windSpeed} km/h
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        {weatherData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pressure</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {weatherData.current.pressure}
                  </p>
                  <p className="text-xs text-gray-500">hPa</p>
                </div>
                <Gauge className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Visibility</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {weatherData.current.visibility}
                  </p>
                  <p className="text-xs text-gray-500">km</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">UV Index</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {weatherData.current.uvIndex}
                  </p>
                  <p className="text-xs text-gray-500">High</p>
                </div>
                <Sun className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Feels Like</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {weatherData.current.feelsLike}°C
                  </p>
                  <p className="text-xs text-gray-500">Warmer</p>
                </div>
                <Thermometer className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Forecast */}
        {weatherData && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                5-Day Forecast
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weatherData.forecast.map((day, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-lg hover:bg-gray-50"
                >
                  <p className="font-semibold text-gray-900 mb-2">{day.day}</p>
                  <day.icon className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                  <p className="text-sm text-gray-600 mb-2">{day.condition}</p>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-gray-900">{day.high}°</p>
                    <p className="text-sm text-gray-500">{day.low}°</p>
                    <p className="text-xs text-blue-500">
                      {day.precipitation}% rain
                    </p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

         {/* Evapotranspiration Data */}
         {weatherData?.evapotranspiration && (
           <div className="bg-white rounded-lg border shadow-sm">
             <div className="p-6 border-b border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                 <Leaf className="h-5 w-5 text-green-600" />
                 Evapotranspiration & Water Balance
               </h3>
             </div>
             <div className="p-6">
               {/* Current ET Values */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                 <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm text-blue-600 font-medium">Potential ET</p>
                       <p className="text-2xl font-bold text-blue-900">
                         {weatherData.evapotranspiration.current.pet}
                       </p>
                       <p className="text-xs text-blue-500">mm/day</p>
                     </div>
                     <TrendingUp className="h-8 w-8 text-blue-500" />
                   </div>
                 </div>
                 <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm text-green-600 font-medium">Actual ET</p>
                       <p className="text-2xl font-bold text-green-900">
                         {weatherData.evapotranspiration.current.aet}
                       </p>
                       <p className="text-xs text-green-500">mm/day</p>
                     </div>
                     <Leaf className="h-8 w-8 text-green-500" />
                   </div>
                 </div>
                 <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm text-purple-600 font-medium">Evaporation</p>
                       <p className="text-2xl font-bold text-purple-900">
                         {weatherData.evapotranspiration.current.evaporation}
                       </p>
                       <p className="text-xs text-purple-500">mm/day</p>
                     </div>
                     <Waves className="h-8 w-8 text-purple-500" />
                   </div>
                 </div>
                 <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm text-orange-600 font-medium">Soil Moisture</p>
                       <p className="text-2xl font-bold text-orange-900">
                         {weatherData.evapotranspiration.current.soilMoisture}%
                       </p>
                       <p className="text-xs text-orange-500">Current</p>
                     </div>
                     <Droplets className="h-8 w-8 text-orange-500" />
                   </div>
                 </div>
               </div>

               {/* ET Forecast */}
               <div className="mb-6">
                 <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                   <Calendar className="h-4 w-4" />
                   5-Day ET Forecast
                 </h4>
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm">
                     <thead>
                       <tr className="border-b border-gray-200">
                         <th className="text-left py-2 font-medium text-gray-600">Date</th>
                         <th className="text-right py-2 font-medium text-gray-600">PET</th>
                         <th className="text-right py-2 font-medium text-gray-600">AET</th>
                         <th className="text-right py-2 font-medium text-gray-600">Evaporation</th>
                         <th className="text-right py-2 font-medium text-gray-600">Soil Moisture</th>
                       </tr>
                     </thead>
                     <tbody>
                       {weatherData.evapotranspiration.forecast.map((day, index) => (
                         <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                           <td className="py-2 text-gray-900">
                             {new Date(day.date).toLocaleDateString('en-US', { 
                               month: 'short', 
                               day: 'numeric' 
                             })}
                           </td>
                           <td className="py-2 text-right text-blue-600 font-medium">{day.pet}</td>
                           <td className="py-2 text-right text-green-600 font-medium">{day.aet}</td>
                           <td className="py-2 text-right text-purple-600 font-medium">{day.evaporation}</td>
                           <td className="py-2 text-right text-orange-600 font-medium">{day.soilMoisture}%</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>

               {/* Historical ET Data */}
               <div>
                 <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                   <TrendingUp className="h-4 w-4" />
                   7-Day Historical ET Data
                 </h4>
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm">
                     <thead>
                       <tr className="border-b border-gray-200">
                         <th className="text-left py-2 font-medium text-gray-600">Date</th>
                         <th className="text-right py-2 font-medium text-gray-600">PET</th>
                         <th className="text-right py-2 font-medium text-gray-600">AET</th>
                         <th className="text-right py-2 font-medium text-gray-600">Evaporation</th>
                         <th className="text-right py-2 font-medium text-gray-600">Soil Moisture</th>
                       </tr>
                     </thead>
                     <tbody>
                       {weatherData.evapotranspiration.historical.map((day, index) => (
                         <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                           <td className="py-2 text-gray-900">
                             {new Date(day.date).toLocaleDateString('en-US', { 
                               month: 'short', 
                               day: 'numeric' 
                             })}
                           </td>
                           <td className="py-2 text-right text-blue-600 font-medium">{day.pet}</td>
                           <td className="py-2 text-right text-green-600 font-medium">{day.aet}</td>
                           <td className="py-2 text-right text-purple-600 font-medium">{day.evaporation}</td>
                           <td className="py-2 text-right text-orange-600 font-medium">{day.soilMoisture}%</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Agricultural Recommendations */}
         <div className="bg-white rounded-lg border shadow-sm">
           <div className="p-6 border-b border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900">
               Agricultural Recommendations
             </h3>
           </div>
           <div className="p-6 space-y-4">
             <div className="p-4 bg-green-50 rounded-lg border border-green-200">
               <h4 className="font-semibold text-green-900 mb-2">
                 Today's Activities
               </h4>
               <p className="text-sm text-green-800">
                 Perfect conditions for field work and spraying. Low wind speed
                 ideal for pesticide application.
               </p>
             </div>
             <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
               <h4 className="font-semibold text-yellow-900 mb-2">
                 Tomorrow's Planning
               </h4>
               <p className="text-sm text-yellow-800">
                 Cloudy conditions expected. Consider postponing irrigation as rain
                 is possible.
               </p>
             </div>
             <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
               <h4 className="font-semibold text-blue-900 mb-2">
                 Rain Alert - Thursday
               </h4>
               <p className="text-sm text-blue-800">
                 85% chance of rain. Suspend irrigation and ensure proper drainage.
                 Good for natural watering.
               </p>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}
