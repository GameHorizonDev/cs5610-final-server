const { User } = require('../models/User');

const ensureAuth = (shouldBeAuthenticated) => {
  return (req, res, next) => {
    const isUserAuthenticated = req.isAuthenticated();

    if (shouldBeAuthenticated == isUserAuthenticated) {
      return next(); // User is correctly authenticated or correctly not authenticated
    }
    
    return res.status(401).json({ message: "Unauthorized access." });
  };
};

const ensureAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized access." });
  }

  const user = await User.findById(req.user);
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ message: "Unauthorized access." });
  }

  return next();
}

module.exports = { ensureAuth, ensureAdmin }