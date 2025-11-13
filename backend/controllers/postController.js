const Post = require("../models/Post");
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





// ✅ Get all posts
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ success: true, posts });
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

    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    post.text = req.body.text || post.text;

    if (req.file) {
      post.image = await uploadToCloudinary(req.file.buffer);
    }

    await post.save();
    res.json({ success: true, post });
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

    post.comments.push({
      user: req.user.id,
      text: req.body.text,
      createdAt: new Date()
    });

    await post.save();
    res.json({ success: true, comments: post.comments });
  } catch (err) {
    next(err);
  }
};

// ✅ Delete Comment
exports.deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(404).json({ success: false, message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);

    if (!comment)
      return res.status(404).json({ success: false, message: "Comment not found" });

    if (comment.user.toString() !== req.user.id && post.author.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    comment.remove();
    await post.save();
    res.json({ success: true, comments: post.comments });
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
