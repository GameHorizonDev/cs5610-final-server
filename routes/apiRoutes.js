const router = require('express').Router();
// prefix to all these routes is /games-api

const axios = require('axios');


router.get('/', async (req, res) => {
    try {
      const response = await axios.get('https://www.freetogame.com/api/games');
      res.json(response.data);
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
    try {
      const response = await axios.get(`https://www.freetogame.com/api/games/game?id=${gameId}`);
      res.json(response.data);
      } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ message: 'Error fetching games' });
    }
});

module.exports = router;