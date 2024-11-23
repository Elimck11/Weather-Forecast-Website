import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js'; 
import weatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
//? is this how to get the city?
router.post('/', async (req, res) => {
  try {
  // TODO: GET weather data from city name
  const cityName = req.body.cityName;
  weatherService.getWeatherForCity(cityName).then((data) => 
    res.json(data));
  
  
  // TODO: save city to search history
  await HistoryService.addCity(cityName);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    const savedWeather = await HistoryService.getCities();
    res.json(savedWeather);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(400).json({ msg: 'City id is required' });
    }
    await HistoryService.removeCity(req.params.id);
    res.json({ success: 'City successfully removed from search history' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;