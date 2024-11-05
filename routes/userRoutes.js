const { ensureAuth } = require('./middleware');
const User = require('../models/User');

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
        }
        if (username) user.username = username;
        if (role) user.role = role;
    
        if (password) {
            user.setPassword(password, async (err) => {
            if (err) {
                return res.status(500).json({ message: "Error setting password.", error: err.message });
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
  
module.exports = router