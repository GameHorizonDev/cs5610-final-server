const express = require('express');
const app = express();
const port = 5000;

const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

const mongoose = require('mongoose');
const mongodb_URI = 'mongodb://0.0.0.0:27017/'
mongoose.connect(mongodb_URI, {
    dbName: 'cs5610_db',
}).then(() => console.log("Connected to MongoDB")).catch(error => console.log(error));

const session = require("express-session");
app.use(
  session({
    secret: "session_secret_333",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days
    },
    resave: false,
    saveUninitialized: false,
  })
);

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
const {setUpLocalPassport, setUpPassportSerializers} = require("./config/passport-config")
setUpLocalPassport(passport);
setUpPassportSerializers(passport);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/example', (req, res) => {
    res.json({title: 'Super Platformer',});
});

app.get('/session', (req, res) => {
  console.log(req.session)
  res.json(req.session);
});

app.use('/games-api', require("./routes/apiRoutes"));
app.use('/', require("./routes/authRoutes"));
app.use('/user', require("./routes/userRoutes"));
app.use('/profile', require("./routes/profileRoutes"));
app.use('/review', require("./routes/reviewRoutes"));
app.use('/comment', require("./routes/commentRoutes"));
app.use('/game', require("./routes/gameRoutes"));

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = server