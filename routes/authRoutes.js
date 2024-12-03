const { ensureAuth } = require('./middleware');
const passport = require("passport");
const { Audience, Critic, Admin } = require("../models/User");

const router = require('express').Router();

router.post('/login', ensureAuth(false), (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Server error", error: err });
      }
      if (!user) {
        return res.status(401).json({ message: "Incorrect login" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login failed", error: loginErr });
        }
        req.session.testing = '333'
        return res.status(200).json({ message: "Login successful", user });
      });
    })(req, res, next);
});

router.post("/logout", ensureAuth(true), (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return res.status(500).json({ message: "Logout failed", error: err });
      }
      res.status(200).json({ message: "Successfully logged out" });
    });
});
  

router.post('/register', ensureAuth(false), (req, res) => {
    const { username, email, role, password } = req.body;
  
    if (!username || !email || !role || !password) {
      return res.status(400).json({ message: "Please fill out all fields." });
    }
  
    const newUser = { username: username, email: email, role: role };
  
    if (role === 'admin') {
      Admin.register(newUser, password, (error, user) => {
        if (user) {
          passport.authenticate('local')(req, res, () => {
            return res.status(201).json({ message: 'Account created successfully!', user });
          });
        } else {
          return res.status(400).json({ message: `Failed to create user account because: ${error.message}.` });
        }
      });
    } else if (role === 'audience') {
      Audience.register(newUser, password, (error, user) => {
        if (user) {
          passport.authenticate('local')(req, res, () => {
            return res.status(201).json({ message: 'Account created successfully!', user });
          });
        } else {
          return res.status(400).json({ message: `Failed to create user account because: ${error.message}.` });
        }
      });
    } else if (role === 'critic') {
      Critic.register(newUser, password, (error, user) => {
        if (user) {
          passport.authenticate('local')(req, res, () => {
            return res.status(201).json({ message: 'Account created successfully!', user });
          });
        } else {
          return res.status(400).json({ message: `Failed to create user account because: ${error.message}.` });
        }
      });
    } else {
      return res.status(400).json({ message: "Invalid role given for creation." });
    }
    
});  
  
module.exports = router;