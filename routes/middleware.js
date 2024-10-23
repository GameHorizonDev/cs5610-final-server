const ensureAuth = (shouldBeAuthenticated) => {
  return (req, res, next) => {
    const isUserAuthenticated = req.isAuthenticated();

    if (shouldBeAuthenticated == isUserAuthenticated) {
      return next(); // User is correctly authenticated or correctly not authenticated
    }
    
    return res.status(401).json({ message: "Unauthorized access." });
  };
};

module.exports = { ensureAuth }