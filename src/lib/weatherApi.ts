import { WeatherData } from './types';

const OPENWEATHER_API_KEY = 'demo'; // Users should replace with their API key

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    // For demo purposes, return mock data
    // In production, use: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    
    // Simulate API call with realistic mock data based on location
    const mockWeather: WeatherData = {
      temperature: Math.round(25 + Math.random() * 15),
      humidity: Math.round(50 + Math.random() * 40),
      rainfall: Math.random() > 0.7 ? Math.round(Math.random() * 30) : 0,
      description: getRandomWeatherDescription(),
      icon: getRandomWeatherIcon(),
      windSpeed: Math.round(5 + Math.random() * 15),
      feelsLike: Math.round(26 + Math.random() * 14)
    };
    
    return mockWeather;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

const getRandomWeatherDescription = (): string => {
  const descriptions = [
    'Clear sky',
    'Few clouds',
    'Scattered clouds',
    'Partly cloudy',
    'Light rain',
    'Sunny',
    'Humid'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const getRandomWeatherIcon = (): string => {
  const icons = ['01d', '02d', '03d', '04d', '09d', '10d'];
  return icons[Math.floor(Math.random() * icons.length)];
};

export const getWeatherIconUrl = (icon: string): string => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};
