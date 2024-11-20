import { Router } from 'express';
import weatherService from '../../service/weatherService';
import historyService from '../../service/historyService';
const router = Router();

// TODO: POST Request with city name to retrieve weather data
router.post ('/', async (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ message: 'City name is required'});
  }
  // TODO: GET weather data from city name
  try {
    const weatherData = await weatherService.getWeather(city)
  }
  // TODO: save city to search history
  await historyService.saveCityToHistory(city);

  return res.status(200).json({ weatherData });
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: 'Failed to retrive weather data'});
}
});

// TODO: GET search history
router.get('/history', async (req, res) => {
  try {
    const history = await historyService.getSearchHistory();

    return res.status(200).json({ history });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to retrive search history' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'City ID is required' });
  }

  try {
    // Delete the city from the search history using HistoryService
    await historyService.deleteCityFromHistory(id);

    // Respond with success
    return res.status(200).json({ message: 'City deleted from history' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete city from history' });
  }
});

export default router;