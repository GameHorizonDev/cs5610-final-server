const router = require('express').Router();
// prefix to all these routes is /games-api

const axios = require('axios');
let API_GAMES = null;

const fetchGames = async () => {
  try {
    const api_response = await axios.get('https://www.freetogame.com/api/games');
    API_GAMES = api_response.data;
  } catch {
    console.log("Error trying to set initial api games -- possibly rate limited.");
  }
};

fetchGames();


router.get('/', async (req, res) => {
    if (API_GAMES) {
      return res.json(API_GAMES);
    }
    try {
      const response = await axios.get('https://www.freetogame.com/api/games');
      API_GAMES = response.data;
      res.json(API_GAMES);
      /* this returns as a list of dictionaries. Example entry is:
      {
        "id": 582,
        "title": "Tarisland",
        "thumbnail": "https://www.freetogame.com/g/582/thumbnail.jpg",
        "short_description": "A cross-platform MMORPG developed by Level Infinite and Published by Tencent.",
        "game_url": "https://www.freetogame.com/open/tarisland",
        "genre": "MMORPG",
        "platform": "PC (Windows)",
        "publisher": "Tencent",
        "developer": "Level Infinite",
        "release_date": "2024-06-22",
        "freetogame_profile_url": "https://www.freetogame.com/tarisland"
      } */
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ message: 'Error fetching games' });
    }
});
  
router.get("/byId/:gameId", async (req, res) =>  {
    const { gameId } = req.params;
    
    if (API_GAMES) {
      const game = API_GAMES.find(g => g.id === parseInt(gameId));
      if (game) {
        return res.json(game);
      } else {
        return res.status(404).json({ message: 'Game not found' });
      }
    }

    try {
      const response = await axios.get(`https://www.freetogame.com/api/games/game?id=${gameId}`);
      res.json(response.data);
      } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ message: 'Error fetching games' });
    }
});

module.exports = router;