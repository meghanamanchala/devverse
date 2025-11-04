const User = require('../models/User');
const bcrypt = require('bcryptjs');

// User controller logic

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// Delete user profile
exports.deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// Follow a user
exports.followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (!userToFollow) return res.status(404).json({ success: false, message: 'User not found' });
    if (userToFollow._id.equals(currentUser._id)) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }
    if (!currentUser.following) currentUser.following = [];
    if (!userToFollow.followers) userToFollow.followers = [];
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ success: false, message: 'Already following' });
    }
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);
    await currentUser.save();
    await userToFollow.save();
    res.json({ success: true, message: 'User followed' });
  } catch (err) {
    next(err);
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (!userToUnfollow) return res.status(404).json({ success: false, message: 'User not found' });
    if (!currentUser.following) currentUser.following = [];
    if (!userToUnfollow.followers) userToUnfollow.followers = [];
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ success: false, message: 'Not following' });
    }
    currentUser.following = currentUser.following.filter(uid => !uid.equals(userToUnfollow._id));
    userToUnfollow.followers = userToUnfollow.followers.filter(uid => !uid.equals(currentUser._id));
    await currentUser.save();
    await userToUnfollow.save();
    res.json({ success: true, message: 'User unfollowed' });
  } catch (err) {
    next(err);
  }
};

// Search users by username or skills
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } }
      ]
    }).select('-password');
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};