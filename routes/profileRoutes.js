const { ensureAuth } = require('./middleware');
const User = require('../models/User');

const router = require('express').Router();
// prefix to all these routes is /profile

const getUserWithPopulatedFields = async (userId) => {
    const user = await User.findById(userId).populate('reviews').populate('comments');
    if (!user) {
        throw new Error('User not found');
    }
    
    return user
};

const handleGetUser = async (req, res, userId) => {
    try {
        const populatedUser = await getUserWithPopulatedFields(userId);
        res.status(200).json(populatedUser);
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message });
    }
};

router.get('/', ensureAuth(true), (req, res) => {
    handleGetUser(req, res, req.user);
});

router.get('/:profileId', ensureAuth(true), (req, res) => {
    handleGetUser(req, res, req.params.profileId);
});

module.exports = router;
