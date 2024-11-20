import dotenv from 'dotenv';
import fetch from 'node-fetch';  // Or use another HTTP request library like axios
dotenv.config();

// Coordinates interface
interface Coordinates {
  lat: number;
  lon: number;
}

// Weather class
interface Weather {
  name: string;
  city: string;
  dt: number;
  date: string;
  weather: Object;
  icon: string;
  iconDescription: string;
  main: Object;
  temp: number;
  tempF: number;
  humidity: number;
  wind: Object;
  windSpeed: number;
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private cityName: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5';  // Example base URL
    this.apiKey = process.env.WEATHER_API_KEY || '';  // API key from environment variables
    this.cityName = '';  // Default city name, can be updated in method calls
  }

  // Build geocode query for location lookup
  private buildGeocodeQuery(city: string): string {
    return `${this.baseURL}/weather?q=${city}&appid=${this.apiKey}&units=metric`; 
    // Assuming we want the temperature in Celsius (`units=metric`)
  }

  // Build weather query using coordinates (latitude and longitude)
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `lat=${coordinates.lat}&lon=${coordinates.lon}`;
  }

  // Fetch location data by city name
  private async fetchLocationData(query: string): Promise<any> {
    const response = await fetch
    (`${this.baseURL}/geo/1.0/direct?q=${query}&APPID=${this.apiKey}`);
    if (!response.ok) {
      throw new Error(`Error fetching location data: ${response.statusText}`);
    }
    return response.json();
  }

  // Fetch and destructure location data into coordinates
  private destructureLocationData(locationData: any): Coordinates {
    const location: Coordinates = {
      lat: locationData.coord.lat,
      lon: locationData.coord.lon,
    };
    return location;
  }

  // Fetch location data and return coordinates
  private async fetchAndDestructureLocationData(query: Coordinates) {
    const locationData = this.destructureLocationData(query);
    return this.buildWeatherQuery(locationData);
  }

  // Fetch weather data for a given coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    try {
      let query = await this.fetchAndDestructureLocationData(coordinates);
      const responseURL = `${this.baseURL}/data/2.5/forecast?${query}&APPID=${this.apiKey}`;
      const response = await fetch(responseURL);
      const weatherRaw = await response.json();
      const responseURLCurrent = `${this.baseURL}/data/2.5/weather?${query}&APPID=${this.apiKey}`;
      const responseCurrent = await fetch(responseURLCurrent);
      const weatherRawCurrent = await responseCurrent.json();
      const forecast = await this.buildForecastArray(weatherRawCurrent,weatherRaw.list);
      // const forecast = await this.buildForecastArray(weatherRaw,weatherRaw.list);
      return forecast;
    } catch (err) {
      return err;
    }
  }

  // Parse the current weather from the response data
  private parseCurrentWeather(response: Weather) {
    const weatherObject: Weather = {
      name: response.name,
      city: response.name,
      dt: response.dt,
      date: (new Date(response.dt * 1000)).toString(),
      weather: response.weather,
      icon: Object.values(response.weather)[0].icon,
      iconDescription: Object.values(response.weather)[0].description,
      main: response.main,
      temp: Object.values(response.main)[0],
      tempF: 0,
      humidity: 0,
      wind: response.wind,
      windSpeed: Object.values(response.wind)[0],
    };
    weatherObject.tempF =  Number(((weatherObject.temp - 273.15) * 1.8 + 32).toFixed(2));
    for (const [key, value] of Object.entries(response.main)) {
      if (key === 'humidity') {
        weatherObject.humidity = value;
        break
      }
    }
    return weatherObject;
  };

  // Build the forecast array from the current weather and forecast data
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    return weatherData.map((forecast: any) => {
      this.parseCurrentWeather(forecast)
      
    });
  }

  // Get weather data for a city (uses both location and weather data)
  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      // First, fetch and destructure location data for the city
      const coordinates = await this.fetchAndDestructureLocationData(city);

      // Then, fetch the weather data using the coordinates
      const weatherData = await this.fetchWeatherData(coordinates);

      // Parse the current weather data
      const currentWeather = this.parseCurrentWeather(weatherData);

      // Optionally, you could extend this to include forecast data (for example, 5-day forecast)
      const forecastArray = this.buildForecastArray(currentWeather, weatherData.list || []);

      // Return the weather data for the city (could include both current weather and forecast)
      return [currentWeather, ...forecastArray];
    } catch (error) {
      console.error('Error getting weather data:', error);
      throw error;
    }
  }
}

export default new WeatherService();
