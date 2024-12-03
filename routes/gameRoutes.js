const { ensureAuth } = require('./middleware');
const Game = require('../models/Game');
const { User } = require('../models/User');

const router = require('express').Router();
// prefix to all these routes is /game

router.get('/view/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const game = await Game.findOne({ gameId: gameId });

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.status(200).json(game);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve game', error: error.message });
    }
});

router.post('/favorite/:gameId', ensureAuth(true), async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user;

        const user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let game = await Game.findOne({ gameId: gameId });

        if (!game) {
            game = await Game.create({
                gameId: gameId,
              });
        }

        if (game.favoritedBy.includes(userId)) {
            return res.status(400).json({ message: 'Game already favorited' });
        }

        game.favoritedBy.push(userId);
        await game.save();
        user.favoriteGames.push(game._id);
        await user.save();

        res.status(200).json({ message: 'Game favorited successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to favorite game', error: error.message });
    }
});

router.post('/unfavorite/:gameId', ensureAuth(true), async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user;

        const user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const game = await Game.findOne({ gameId });

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (!game.favoritedBy.includes(userId)) {
            return res.status(400).json({ message: 'Game not favorited' });
        }

        game.favoritedBy.pull(userId);
        await game.save();
        user.favoriteGames.pull(game._id);
        await user.save();

        res.status(200).json({ message: 'Game unfavorited successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to unfavorite game', error: error.message });
    }
});

module.exports = router;