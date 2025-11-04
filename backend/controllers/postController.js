const Post = require('../models/Post');
const cloudinary = require('../utils/cloudinary');

// Create a post
exports.createPost = async (req, res, next) => {
  try {
    let imageUrl = '';
    if (req.body.image) {
      const uploadRes = await cloudinary.uploader.upload(req.body.image, { folder: 'devverse_posts' });
      imageUrl = uploadRes.secure_url;
    }
    const post = await Post.create({
      text: req.body.text,
      image: imageUrl,
      author: req.user.id
    });
    res.status(201).json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// Get all posts
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};

// Get single post
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// Update post
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    post.text = req.body.text || post.text;
    if (req.body.image) {
      const uploadRes = await cloudinary.uploader.upload(req.body.image, { folder: 'devverse_posts' });
      post.image = uploadRes.secure_url;
    }
    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// Delete post
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

// Like a post
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already liked' });
    }
    post.likes.push(req.user.id);
    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (err) {
    next(err);
  }
};

// Unlike a post
exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.likes = post.likes.filter(uid => uid.toString() !== req.user.id);
    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (err) {
    next(err);
  }
};

// Add a comment
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const comment = {
      user: req.user.id,
      text: req.body.text
    };
    post.comments.push(comment);
    await post.save();
    res.status(201).json({ success: true, comments: post.comments });
  } catch (err) {
    next(err);
  }
};

// Delete a comment
exports.deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id && post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    comment.deleteOne();
    await post.save();
    res.json({ success: true, comments: post.comments });
  } catch (err) {
    next(err);
  }
};