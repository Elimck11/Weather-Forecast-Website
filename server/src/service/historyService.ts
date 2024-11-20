// TODO: Define a City class with name and id properties
import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';

class City {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

// TODO: Complete the HistoryService class
class HistoryService {
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    return await fs.readFile('db/db.json', {
      flag: 'a',
      encoding: 'utf8'
  });
}
  private async write(cities: City[]) {
    return await fs.writeFile('db/db.json', JSON.stringify(cities, null, '\t'));
  }
      
  // private async read() {}
  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  
  // private async write(cities: City[]) {}
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    return await this.read().then((cities) => {
      let arrayOfCities: City[];
      try {
        arrayOfCities = [].concat(JSON.parse(cities));
      } catch (err) {
        arrayOfCities = []
      }
      return arrayOfCities;
    });
    
  }
  // async getCities() {}
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(cityName: string) {
    if (!cityName) {
      throw new Error
    }
    const newCity: City={ id:uuidv4(), name:cityName}; // Generate a unique ID
    return await this.getCities().then((cities) => {
      if (cities.find((existingCity) => existingCity.name === newCity.name)) {
        return cities
      } 
      return [...cities, newCity];
    });
  }
  // async addCity(city: string) {}
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: any) {
    return await this.getCities()
    .then((cities) => cities.filter((city) => city.id !== id))
    .then((filteredStates) => this.write(filteredStates));
  }
    }
  // async removeCity(id: string) {}

export default new HistoryService();
      
