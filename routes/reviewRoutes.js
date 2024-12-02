const { ensureAuth } = require('./middleware');
const Review = require('../models/Review');
const User = require('../models/User');

const router = require('express').Router();
// prefix to all these routes is /review

router.post('/add', ensureAuth(true), async (req, res) => {
    try {
        const { gameId, rating, text } = req.body;

        const newReview = await Review.create({
            gameId: gameId,
            reviewerId: req.user,
            rating: rating,
            text: text,
        });

        res.status(201).json(newReview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add review', error: error.message });
    }
});

router.get('/view/:revId', async (req, res) => {
    try {
        const { revId } = req.params;

        const review = await Review.findById(revId).populate('reviewerId').populate('comments');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve review', error: error.message });
    }
});

router.delete('/delete/:revId', ensureAuth(true), async (req, res) => {
    try {
        const { revId } = req.params;

        const review = await Review.findById(revId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const user = await User.findById(req.user);

        if (user.role !== "admin" && user._id.toString() !== review.reviewerId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this review' });
        } 

        await Review.findByIdAndDelete(revId);

        // delete all review bookmarks related to this review
        await User.updateMany(
            { bookmarkedReviews: revId },
            { $pull: { bookmarkedReviews: revId } }
        );

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete review', error: error.message });
    }
});

router.patch('/edit/:revId', ensureAuth(true), async (req, res) => {
    try {
        const { revId } = req.params;
        const { rating, text } = req.body;

        if (!rating && !text) {
            return res.status(400).json({ message: "Must provide a field to change" });
        }    

        const review = await Review.findById(revId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const user = await User.findById(req.user);

        if (user.role !== "admin" && user._id.toString() !== review.reviewerId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to edit this review' });
        } 

        if (rating) review.rating = rating;
        if (text) review.text = text;

        await review.save();

        res.status(200).json({ message: 'Review updated successfully', review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update review', error: error.message });
    }
});

router.post('/bookmark/:revId', ensureAuth(true), async (req, res) => {
    try {
        const { revId } = req.params;

        const user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const review = await Review.findById(revId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (user.bookmarkedReviews.includes(revId)) {
            return res.status(400).json({ message: 'Review already bookmarked' });
        }

        review.bookmarkedBy.push(user._id);
        await review.save();
        user.bookmarkedReviews.push(revId);
        await user.save();


        res.status(200).json({ message: 'Review bookmarked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to bookmark review', error: error.message });
    }
});

router.post('/unbookmark/:revId', ensureAuth(true), async (req, res) => {
    try {
        const { revId } = req.params;

        const user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const review = await Review.findById(revId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (!user.bookmarkedReviews.includes(revId)) {
            return res.status(400).json({ message: 'Review not bookmarked' });
        }

        review.bookmarkedBy.pull(user._id);
        await review.save();
        user.bookmarkedReviews.pull(revId);
        await user.save();

        res.status(200).json({ message: 'Review unbookmarked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to unbookmark review', error: error.message });
    }
});

router.get('/all/by-game-id/:gameId', async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameId);
        if (isNaN(gameId)) {
            return res.status(400).json({ error: 'Invalid game ID' });
        }

        let amount;
        if (req.query.amount) {
            amount = parseInt(req.query.amount);
            if (isNaN(amount) || amount < 0) {
                res.status(500).json({ error: "Invalid amount passed." });
            }
        }

        if (!amount) {
            const reviews = await Review.find({ gameId: gameId })
            .populate('reviewerId')
            .populate('comments')
            .populate('bookmarkedBy');
            res.status(200).json(reviews);
            return;
        } else {
            const reviews = await Review.find({ gameId: gameId })
            .populate('reviewerId')
            .populate('comments')
            .populate('bookmarkedBy')
            .limit(amount);
            res.status(200).json(reviews);
            return;
        }
        
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/get-all/:amount', async (req, res) => {
    try {
        const amount = parseInt(req.params.amount);
        // -1 means no limit
        if (isNaN(amount) || (amount <= 0 && amount != -1)) {
            return res.status(400).json({ error: 'Invalid amount specified' });
        }

        let reviews;
        if (amount === -1) {
            reviews = await Review.find()
                .populate('reviewerId')
                .populate('comments')
                .populate('bookmarkedBy');
        } else {
            reviews = await Review.find()
                .populate('reviewerId')
                .populate('comments')
                .populate('bookmarkedBy')
                .limit(amount);
        }

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;