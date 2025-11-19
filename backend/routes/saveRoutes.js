const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { getSavedPosts } = require("../controllers/saveController");


router.get("/saved-posts", authMiddleware, getSavedPosts);


// ⭐ SAVE POST
router.post("/:postId/save", authMiddleware, async (req, res) => {
  try {
    const clerkId = req.user.id;
    const { postId } = req.params;

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.savedPosts.includes(postId)) {
      user.savedPosts.push(postId);
      await user.save();
    }

    res.json({ message: "Post saved", savedPosts: user.savedPosts });
  } catch (err) {
    console.error("❌ Save error:", err);
    res.status(500).json({ message: "Failed to save post" });
  }
});

// ⭐ UNSAVE POST
router.post("/:postId/unsave", authMiddleware, async (req, res) => {
  try {
    const clerkId = req.user.id;
    const { postId } = req.params;

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    await user.save();

    res.json({ message: "Post unsaved", savedPosts: user.savedPosts });
  } catch (err) {
    console.error("❌ Unsave error:", err);
    res.status(500).json({ message: "Failed to unsave post" });
  }
});

module.exports = router;
