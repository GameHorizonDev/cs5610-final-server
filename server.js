const express = require('express');
const app = express();
const port = 5000;

const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/example', (req, res) => {
    res.json({title: 'Super Platformer',});
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
