// Get posts by user
exports.getPostsByUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
    // Collect all user IDs (authors + commenters)
    const authorIds = posts.map((p) => p.author);
    const commentUserIds = posts.flatMap((p) => p.comments.map((c) => c.user));
    const allUserIds = [...new Set([...authorIds, ...commentUserIds])];
    const users = await User.find({ clerkId: { $in: allUserIds } }).select("clerkId username name");
    const userMap = {};
    users.forEach((u) => {
      userMap[u.clerkId] = { username: u.username, name: u.name };
    });
    const postsWithUser = posts.map((post) => {
      const postObj = post.toObject();
      postObj.user = userMap[post.author] || null;
      postObj.comments = postObj.comments.map((c) => ({
        ...c,
        userInfo: userMap[c.user] || null
      }));
      return postObj;
    });
    res.json({ success: true, posts: postsWithUser });
  } catch (err) {
    next(err);
  }
};
// Report a post
exports.reportPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    // Option 1: Log to console (minimal)
    // console.log(`Post ${post._id} reported by user ${req.user.id}. Reason:`, req.body.reason);

    // Option 2: Store reports in post (recommended)
    if (!post.reports) post.reports = [];
    post.reports.push({
      user: req.user.id,
      reason: req.body.reason || "No reason provided",
      createdAt: new Date()
    });
    await post.save();
    res.json({ success: true, message: "Report submitted" });
  } catch (err) {
    next(err);
  }
};
const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "devverse_posts" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
};

exports.createPost = async (req, res) => {
  try {
  console.log("✅ POST request received");
  console.log("🚩 createPost controller START");
  console.log("➡️ req.body:", req.body);
  console.log("➡️ req.file:", req.file);
  console.log("➡️ req.user:", req.user);

    if (!req.body.text) {
      return res.status(400).json({ success: false, message: "Text required" });
    }

    let imageUrl = "";
    if (req.file) {
      console.log("➡️ Uploading to Cloudinary...");
      imageUrl = await uploadToCloudinary(req.file.buffer);
      console.log("✅ Cloudinary URL:", imageUrl);
    }

    console.log("➡️ Creating post in DB...");

    const post = await Post.create({
      text: req.body.text,
      tags: req.body.tags ? req.body.tags.split(",") : [],
      image: imageUrl,
      author: req.user && req.user.id ? req.user.id : null,
    });

    console.log("✅ Post created:", post._id);
  res.status(201).json({ success: true, post });

  } catch (err) {
    console.log("🔥 SERVER ERROR:");
    console.log(err);
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
};





// ✅ Get all posts (with user info)
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    // Collect all user IDs (authors + commenters)
    const authorIds = posts.map((p) => p.author);
    const commentUserIds = posts.flatMap((p) => p.comments.map((c) => c.user));
    const allUserIds = [...new Set([...authorIds, ...commentUserIds])];
    const users = await User.find({ clerkId: { $in: allUserIds } }).select("clerkId username name");
    const userMap = {};
    users.forEach((u) => {
      userMap[u.clerkId] = { username: u.username, name: u.name };
    });
    const postsWithUser = posts.map((post) => {
      const postObj = post.toObject();
      // Attach user info to post author
      postObj.user = userMap[post.author] || null;
      // Attach user info to each comment
      postObj.comments = postObj.comments.map((c) => ({
        ...c,
        userInfo: userMap[c.user] || null
      }));
      return postObj;
    });
    res.json({ success: true, posts: postsWithUser });
  } catch (err) {
    next(err);
  }
};

// ✅ Get single post
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// ✅ Update post
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit if you are the author.",
      });
    }

    post.text = req.body.text || post.text;

    if (typeof req.body.tags === "string") {
      post.tags = req.body.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    if (req.file) {
      post.image = await uploadToCloudinary(req.file.buffer);
    }

    await post.save();

    // Fetch author info
    const author = await User.findOne({ clerkId: post.author }).select(
      "clerkId username name"
    );

    // Format response so username never disappears
    const formattedPost = {
      ...post.toObject(),
      user: author || null,
      comments: post.comments.map((c) => ({
        ...c.toObject(),
        userInfo: author || null,
      })),
    };

    res.json({ success: true, post: formattedPost });
  } catch (err) {
    next(err);
  }
};


// ✅ Delete Post
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    await Post.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};

// ✅ Like Post
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    if (post.likes.includes(req.user.id))
      return res.status(400).json({ success: false, message: "Already liked" });

    post.likes.push(req.user.id);
    await post.save();

    // Create notification for post author (if not liking own post)
    if (post.author.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      const authorUser = await User.findOne({ clerkId: post.author });
      if (authorUser) {
        await Notification.create({
          user: authorUser._id,
          type: 'like',
          message: `Your post was liked!`,
          isRead: false
        });
      }
    }

    res.json({ success: true, likes: post.likes.length });
  } catch (err) {
    next(err);
  }
};

// ✅ Unlike Post
exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    await post.save();

    res.json({ success: true, likes: post.likes.length });
  } catch (err) {
    next(err);
  }
};

// ✅ Add Comment
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    const newComment = {
      user: req.user.id,
      text: req.body.text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Create notification for post author (if not commenting own post)
    if (post.author.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      const authorUser = await User.findOne({ clerkId: post.author });
      if (authorUser) {
        await Notification.create({
          user: authorUser._id,
          type: 'comment',
          message: `Someone commented on your post!`,
          isRead: false
        });
      }
    }

    // Get the last inserted (the actual MongoDB comment)
    const savedComment = post.comments[post.comments.length - 1];

    // Attach userInfo
    const userInfo = await User.findOne({ clerkId: savedComment.user }).select(
      "username name"
    );

    res.json({
      success: true,
      comment: {
        ...savedComment.toObject(),
        userInfo: userInfo || null,
      },
    });
  } catch (err) {
    next(err);
  }
};



// ✅ Delete Comment
exports.deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Authorization (user must be comment author or post author)
    if (comment.user.toString() !== req.user.id && post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Remove comment
    post.comments = post.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );

    await post.save();

    // ⭐ Build comments WITH userInfo
    const commentsWithUserInfo = await Promise.all(
      post.comments.map(async (c) => {
        const userInfo = await User.findOne({ clerkId: c.user }).select(
          "username name"
        );
        return {
          ...c.toObject(),
          userInfo: userInfo || null,
        };
      })
    );

    return res.json({
      success: true,
      comments: commentsWithUserInfo,
    });
  } catch (err) {
    next(err);
  }
};


// ✅ Search
exports.searchPosts = async (req, res, next) => {
  try {
    const { q } = req.query;

    const posts = await Post.find({
      $or: [
        { text: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};
