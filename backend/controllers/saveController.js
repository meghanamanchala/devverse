const User = require("../models/User");
const Post = require("../models/Post");

exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id; // Clerk userId

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    // Fetch posts (NO populate)
    const savedPosts = await Post.find({
      _id: { $in: dbUser.savedPosts }
    }).sort({ createdAt: -1 });

    // Inject author user info (same as /posts list)
    const postsWithUser = await Promise.all(
      savedPosts.map(async (post) => {
        const author = await User.findOne({ clerkId: post.author })
          .select("username email name");

        return {
          ...post.toObject(),
          user: author ? {
            username: author.username,
            name: author.name,
            email: author.email
          } : {
            username: "Unknown",
            name: "Unknown User"
          }
        };
      })
    );

    return res.status(200).json({ saved: postsWithUser });
  } catch (err) {
    console.error("Error fetching saved posts:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
