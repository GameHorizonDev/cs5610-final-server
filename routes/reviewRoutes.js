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

        await review.remove();

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

module.exports = router;