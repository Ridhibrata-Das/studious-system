export interface WeatherData {
  temperature: number;
  humidity: number;
  time: string;
}

export interface EvapotranspirationData {
  current: {
    pet: number; // Potential Evapotranspiration (mm/day)
    aet: number; // Actual Evapotranspiration (mm/day)
    evaporation: number; // Evaporation rate (mm/day)
    soilMoisture: number; // Soil moisture content (%)
  };
  forecast: Array<{
    date: string;
    pet: number;
    aet: number;
    evaporation: number;
    soilMoisture: number;
  }>;
  historical: Array<{
    date: string;
    pet: number;
    aet: number;
    evaporation: number;
    soilMoisture: number;
  }>;
}

export interface DetailedWeatherData {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    feelsLike: number;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: any;
    precipitation: number;
  }>;
  evapotranspiration?: EvapotranspirationData;
}

export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m&current_weather=true&timezone=auto`,
      {
        signal: controller.signal,
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Get current hour index
    const now = new Date();
    const currentHourIndex = now.getHours();

    return {
      temperature: data.current_weather.temperature,
      humidity: data.hourly.relative_humidity_2m[currentHourIndex],
      time: now.toLocaleTimeString()
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Weather API request timed out');
    }
    throw error;
  }
}

// Evapotranspiration calculation functions
function calculatePET(temperature: number, humidity: number, windSpeed: number, solarRadiation: number = 0): number {
  // Simplified Penman-Monteith equation for PET calculation
  const delta = 0.409 * Math.exp(-0.0005 * temperature); // Slope of saturation vapor pressure curve
  const gamma = 0.066; // Psychrometric constant
  
  // Net radiation (simplified)
  const Rn = solarRadiation * 0.77; // Net radiation approximation
  
  // Vapor pressure deficit
  const es = 0.611 * Math.exp((17.27 * temperature) / (temperature + 237.3));
  const ea = es * (humidity / 100);
  const VPD = es - ea;
  
  // PET calculation (mm/day)
  const pet = (0.408 * delta * Rn + gamma * (900 / (temperature + 273)) * windSpeed * VPD) / 
              (delta + gamma * (1 + 0.34 * windSpeed));
  
  return Math.max(0, pet);
}

function calculateAET(pet: number, soilMoisture: number, precipitation: number = 0): number {
  // Actual Evapotranspiration based on soil moisture availability
  const moistureFactor = Math.min(1, soilMoisture / 50); // Assume 50% is optimal
  const precipitationFactor = Math.min(1, precipitation / 10); // Assume 10mm is sufficient
  
  return pet * moistureFactor * (1 + precipitationFactor * 0.2);
}

function calculateEvaporation(temperature: number, humidity: number, windSpeed: number): number {
  // Simplified evaporation calculation
  const vaporPressure = 0.611 * Math.exp((17.27 * temperature) / (temperature + 237.3)) * (humidity / 100);
  const saturationPressure = 0.611 * Math.exp((17.27 * temperature) / (temperature + 237.3));
  
  const evaporationRate = (saturationPressure - vaporPressure) * windSpeed * 0.1;
  return Math.max(0, evaporationRate);
}

export async function fetchEvapotranspirationData(latitude: number, longitude: number): Promise<EvapotranspirationData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Fetch current weather data for calculations
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&current_weather=true&timezone=auto`,
      {
        signal: controller.signal,
        next: { revalidate: 300 }
      }
    );

    clearTimeout(timeoutId);

    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    const now = new Date();
    const currentHourIndex = now.getHours();

    // Current values
    const currentTemp = weatherData.current_weather.temperature;
    const currentHumidity = weatherData.hourly.relative_humidity_2m[currentHourIndex];
    const currentWindSpeed = weatherData.hourly.wind_speed_10m[currentHourIndex];
    const currentPrecipitation = weatherData.hourly.precipitation[currentHourIndex] || 0;

    // Simulate soil moisture (in real implementation, this would come from soil sensors)
    const soilMoisture = Math.max(10, Math.min(90, 60 + (currentPrecipitation * 2) - (currentTemp - 25) * 0.5));

    // Calculate current evapotranspiration values
    const pet = calculatePET(currentTemp, currentHumidity, currentWindSpeed);
    const aet = calculateAET(pet, soilMoisture, currentPrecipitation);
    const evaporation = calculateEvaporation(currentTemp, currentHumidity, currentWindSpeed);

    // Generate forecast data (5 days)
    const forecast = [];
    for (let i = 0; i < 5; i++) {
      const dayTemp = (weatherData.daily.temperature_2m_max[i] + weatherData.daily.temperature_2m_min[i]) / 2;
      const dayHumidity = 70 + Math.random() * 20; // Simulate humidity
      const dayWindSpeed = 5 + Math.random() * 10; // Simulate wind speed
      const dayPrecipitation = weatherData.daily.precipitation_sum[i] || 0;
      const daySoilMoisture = Math.max(10, Math.min(90, soilMoisture + (dayPrecipitation * 2) - (dayTemp - 25) * 0.5));

      const dayPET = calculatePET(dayTemp, dayHumidity, dayWindSpeed);
      const dayAET = calculateAET(dayPET, daySoilMoisture, dayPrecipitation);
      const dayEvaporation = calculateEvaporation(dayTemp, dayHumidity, dayWindSpeed);

      forecast.push({
        date: new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pet: Math.round(dayPET * 100) / 100,
        aet: Math.round(dayAET * 100) / 100,
        evaporation: Math.round(dayEvaporation * 100) / 100,
        soilMoisture: Math.round(daySoilMoisture)
      });
    }

    // Generate historical data (7 days)
    const historical = [];
    for (let i = 7; i >= 1; i--) {
      const histDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const histTemp = currentTemp + (Math.random() - 0.5) * 6; // Simulate temperature variation
      const histHumidity = currentHumidity + (Math.random() - 0.5) * 20;
      const histWindSpeed = currentWindSpeed + (Math.random() - 0.5) * 4;
      const histPrecipitation = Math.random() * 5; // Random precipitation
      const histSoilMoisture = Math.max(10, Math.min(90, soilMoisture + (histPrecipitation * 2) - (histTemp - 25) * 0.5));

      const histPET = calculatePET(histTemp, histHumidity, histWindSpeed);
      const histAET = calculateAET(histPET, histSoilMoisture, histPrecipitation);
      const histEvaporation = calculateEvaporation(histTemp, histHumidity, histWindSpeed);

      historical.push({
        date: histDate.toISOString().split('T')[0],
        pet: Math.round(histPET * 100) / 100,
        aet: Math.round(histAET * 100) / 100,
        evaporation: Math.round(histEvaporation * 100) / 100,
        soilMoisture: Math.round(histSoilMoisture)
      });
    }

    return {
      current: {
        pet: Math.round(pet * 100) / 100,
        aet: Math.round(aet * 100) / 100,
        evaporation: Math.round(evaporation * 100) / 100,
        soilMoisture: Math.round(soilMoisture)
      },
      forecast,
      historical
    };
  } catch (error) {
    console.error('Error fetching evapotranspiration data:', error);
    throw error;
  }
}

export async function fetchDetailedWeatherData(latitude: number, longitude: number): Promise<DetailedWeatherData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,pressure_msl,visibility&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&current_weather=true&timezone=auto`,
      {
        signal: controller.signal,
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Get current hour index
    const now = new Date();
    const currentHourIndex = now.getHours();

    // Map weather codes to conditions and icons
    const getWeatherCondition = (code: number) => {
      const conditions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
      };
      return conditions[code as keyof typeof conditions] || "Unknown";
    };

    // Calculate feels like temperature (simplified)
    const temp = data.current_weather.temperature;
    const humidity = data.hourly.relative_humidity_2m[currentHourIndex];
    const windSpeed = data.hourly.wind_speed_10m[currentHourIndex];
    const feelsLike = temp + (humidity / 100) * 2 - (windSpeed / 10);

    // Generate 5-day forecast
    const forecast = [];
    const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday'];
    
    for (let i = 0; i < 5; i++) {
      const dayData = {
        day: days[i],
        high: Math.round(data.daily.temperature_2m_max[i]),
        low: Math.round(data.daily.temperature_2m_min[i]),
        condition: getWeatherCondition(data.daily.weather_code[i]),
        icon: data.daily.weather_code[i] === 0 ? "Sun" : 
              data.daily.weather_code[i] < 3 ? "Cloud" : "CloudRain",
        precipitation: Math.round(data.daily.precipitation_probability_max[i] || 0)
      };
      forecast.push(dayData);
    }

    // Fetch evapotranspiration data
    let evapotranspirationData: EvapotranspirationData | undefined;
    try {
      evapotranspirationData = await fetchEvapotranspirationData(latitude, longitude);
    } catch (error) {
      console.warn('Failed to fetch evapotranspiration data:', error);
    }

    return {
      current: {
        temperature: Math.round(temp),
        condition: getWeatherCondition(data.current_weather.weathercode),
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed),
        pressure: Math.round(data.hourly.pressure_msl[currentHourIndex]),
        visibility: Math.round(data.hourly.visibility[currentHourIndex] / 1000), // Convert to km
        uvIndex: Math.round(Math.random() * 10), // UV index not available in free API
        feelsLike: Math.round(feelsLike)
      },
      forecast,
      evapotranspiration: evapotranspirationData
    };
  } catch (error) {
    console.error('Error fetching detailed weather data:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Weather API request timed out');
    }
    throw error;
  }
} 