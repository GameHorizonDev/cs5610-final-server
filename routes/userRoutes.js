const { ensureAuth, ensureAdmin } = require('./middleware');
const { User } = require('../models/User');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const Game = require('../models/Game');

const router = require('express').Router();
// prefix to all these routes is /user

router.patch('/update-user', ensureAuth(true), async (req, res) => {
    const { username, email, role, password } = req.body;
  
    if (!username && !email && !role && !password) {
        return res.status(400).json({ message: "Must provide a field to change" });
    }
  
    try {    
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
    
        if (email){
            const otherUser = await User.findOne({email: email});
            if (otherUser) {
                return res.status(500).json({ message: "Email already exists." });
            }
            user.email = email;
        }
        if (username) user.username = username;
        if (role) user.role = role;
    
        if (password) {
            return user.setPassword(password, async (err) => {
                if (err) {
                    return res.status(500).json({ message: "Error setting password.", error: err.message });
                }
        
                try {
                    await user.save();
                    return res.status(200).json({ message: "User updated successfully", user });
                } catch (saveError) {
                    console.error(saveError);
                    return res.status(500).json({ message: "Error saving user after updating password.", error: saveError.message });
                }
            });
        }

        await user.save();
        return res.status(200).json({ message: "User updated successfully", user });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while updating the user.", error: error.message });
    }
});

router.get("/getCurrId", (req, res) => {
    if (req.user) {
        res.send(req.user);
    } else {
        res.send("");
    }
});


// admin only routes
router.delete("/delete/:userId", ensureAdmin, async (req, res) => {
    const userId = req.params.userId;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // delete related game info
        await Game.updateMany(
            { favoritedBy: userId },
            { $pull: { favoritedBy: userId } }
        );

        // delete related review info
        const deletedReviews = await Review.find({ reviewerId: userId });
        const deletedReviewIds = deletedReviews.map(review => review._id);
        await Review.deleteMany({ reviewerId: userId });
        await User.updateMany(
            { bookmarkedReviews: { $in: deletedReviewIds } },
            { $pull: { bookmarkedReviews: { $in: deletedReviewIds } } }
        );
        await Review.updateMany(
            { bookmarkedBy: userId },
            { $pull: { bookmarkedBy: userId } }
        );

        // delete all related comment info
        const deletedComments = await Comment.find({ commenterId: userId });
        const deletedCommentIds = deletedComments.map(comment => comment._id);
        await Comment.deleteMany({ commenterId: userId });
        await Review.updateMany(
            { comments: { $in: deletedCommentIds } },
            { $pull: { comments: { $in: deletedCommentIds } } }
        );

        res.status(200).json({ message: "User deleted successfully"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});

router.get("/all", ensureAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users", error: error.message });
    }
});


  
module.exports = router