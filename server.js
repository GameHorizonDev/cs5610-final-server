const express = require('express');
const app = express();
const port = 5000;

const cors = require('cors');
app.use(cors());

const axios = require('axios');

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/example', (req, res) => {
    res.json({title: 'Super Platformer',});
});

app.get('/get-games-api', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
