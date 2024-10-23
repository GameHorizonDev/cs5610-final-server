const User = require('../models/User');
const LocalStrategy = require('passport-local').Strategy;

const setUpLocalPassport = (passport) => {
    passport.use(new LocalStrategy(
        { usernameField: "email" },
        (email, password, done) => {
            User.authenticate()(email, password, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user);
            });
        }
    ));
};

const setUpPassportSerializers = (passport) => {
    passport.serializeUser((req, user, done) => {
        done(null, user.id);
      });
    passport.deserializeUser((id, done) => {
        done(null, id);
    });
}

module.exports = {
    setUpLocalPassport,
    setUpPassportSerializers,
}