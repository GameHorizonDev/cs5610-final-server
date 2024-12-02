const { ensureAuth } = require('./middleware');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const User = require('../models/User');

const router = require('express').Router();
// prefix to all these routes is /comment

router.post('/add/:reviewId', ensureAuth(true), async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { text } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const newComment = await Comment.create({
            reviewId: reviewId,
            commenterId: req.user,
            text: text,
        });

        review.comments.push(newComment._id);
        await review.save();

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
});

router.delete('/delete/:commentId', ensureAuth(true), async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const user = await User.findById(req.user);

        if (user.role !== "admin" && user._id.toString() !== comment.commenterId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        const review = await Review.findById(comment.reviewId);
        if (review) {
            review.comments.pull(commentId);
            await review.save();
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete comment', error: error.message });
    }
});

router.patch('/edit/:commentId', ensureAuth(true), async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Must provide text to change" });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const user = await User.findById(req.user);

        if (user.role !== "admin" && user._id.toString() !== comment.commenterId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to edit this comment' });
        }

        comment.text = text;

        await comment.save();

        res.status(200).json({ message: 'Comment updated successfully', comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update comment', error: error.message });
    }
});

router.get('/all/by-review-id/:revId', async (req, res) => {
    try {
        const revId = req.params.revId;

        const comments = await Comment.find({ reviewId: revId })
            .populate('reviewId')
            .populate('commenterId');

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
