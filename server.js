const express = require('express');
const app = express();
const port = 5001;

const cors = require('cors');
const reactUrl = process.env.REACT_URL || 'http://localhost:3001';
const corsOptions = {
  origin: reactUrl,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

const mongoose = require('mongoose');
const mongodb_URI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/'
mongoose.connect(mongodb_URI, {
    dbName: 'cs5610_db',
}).then(() => console.log("Connected to MongoDB")).catch(error => console.log(error));

const session = require("express-session");
const sessionOptions = {
  secret: "session_secret_333",
  resave: false,
  saveUninitialized: false,
};
const nodeEnv = process.env.NODE_ENV || "dev";
if (nodeEnv !== "dev") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 14,
  };
}
app.use(session(sessionOptions));  

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
  console.log(`Server is running on port: ${port}`);
});

module.exports = server