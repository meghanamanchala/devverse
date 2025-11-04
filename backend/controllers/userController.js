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