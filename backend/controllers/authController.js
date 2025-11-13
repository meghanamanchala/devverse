const User = require('../models/User');

// ✅ Save Clerk user into MongoDB
exports.saveUser = async (req, res) => {
  try {
    const { clerkId, email, name, username } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      return res.json({ message: "User already exists ✅", user: existingUser });
    }

    // Create user
    const newUser = await User.create({
      clerkId,
      email,
      name,
      username,
      followers: [],
      following: [],
      skills: []
    });

    return res.json({ message: "✅ New user saved", user: newUser });
  } catch (err) {
    console.log("❌ Server error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



// what is the error ?