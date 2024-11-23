import dotenv from 'dotenv';
// import { hasUncaughtExceptionCaptureCallback } from 'node:process'; not called at all for some reason?
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lon: string;
  lat: string;
}

// TODO: Define a class for the Weather object
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

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;

  private apiKey?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';

    this.apiKey = process.env.API_KEY || '';
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string){
    try {
      const response = await fetch(
        `${this.baseURL}${this.buildGeocodeQuery()}${query}&APPID=${this.apiKey}`
      )
      const locations = await response.json();

      return locations[0];
    } catch (err) {
      console.log('Error:',err);
      return err;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const locationObject: Coordinates = {
      lon: locationData.lon,
      lat: locationData.lat,
    };
    return locationObject;
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    let query = `/geo/1.0/direct?q=`;
    return query;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    let lat = this.destructureLocationData(coordinates).lat;
    let lon = this.destructureLocationData(coordinates).lon;
    let query = `lat=${lat}&lon=${lon}`;
    return query;
  }
  // TODO: Create fetchAndDestructureLocationData method
  //? destructure this into Weather object?
  private async fetchAndDestructureLocationData(coordinates: Coordinates) {
    const destructuredLocation = this.destructureLocationData(coordinates);
    return this.buildWeatherQuery(destructuredLocation);
    
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      let query = await this.fetchAndDestructureLocationData(coordinates);
      // for forecast data
      const responseURL = `${this.baseURL}/data/2.5/forecast?${query}&APPID=${this.apiKey}`;
      const response = await fetch(responseURL);
      const weatherRaw = await response.json();
      // for current weather
      const responseURLCurrent = `${this.baseURL}/data/2.5/weather?${query}&APPID=${this.apiKey}`;
      const responseCurrent = await fetch(responseURLCurrent);
      const weatherRawCurrent = await responseCurrent.json();
      console.log('#########################################################')
      console.log(weatherRawCurrent);
      console.log('#########################################################')
      const forecast = await this.buildForecastArray(weatherRawCurrent,weatherRaw.list);
      // const forecast = await this.buildForecastArray(weatherRaw,weatherRaw.list);
      return forecast;
    } catch (err) {
      console.log('Error:',err);
      return err;
    }
  }
  // TODO: Build parseCurrentWeather method
  //? will need to update this as it needs an updated Weather interface with usable parameters
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
    //convert default kelvin temperature to fahrenheit
    weatherObject.tempF =  Number(((weatherObject.temp - 273.15) * 1.8 + 32).toFixed(2));
    // find humidity value from main object of response and assign it to the object
    for (const [key, value] of Object.entries(response.main)) {
      if (key === 'humidity') {
        weatherObject.humidity = value;
        break
      }
    }

    return weatherObject;
  }
  // TODO: Complete buildForecastArray method
  //? not sure how this code works just yet
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    let forecast: Weather[] = [currentWeather];
    forecast = weatherData.map((weatherForecast) => 
      this.parseCurrentWeather(weatherForecast));
    const todayWeather = this.parseCurrentWeather(currentWeather);
    forecast.unshift(todayWeather);
    return forecast;
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    const locationData = await this.fetchLocationData(city);
    const coordinates = this.destructureLocationData(locationData);
    const weatherData = await this.fetchWeatherData(coordinates);
    return weatherData;
}
}

export default new WeatherService();