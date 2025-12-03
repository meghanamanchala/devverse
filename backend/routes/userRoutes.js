// User routes
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteProfile, followUser, unfollowUser, searchUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/users/profile
router.get('/profile', authMiddleware, getProfile);

// @route   PUT /api/users/profile
router.put('/profile', authMiddleware, updateProfile);

// @route   DELETE /api/users/profile
router.delete('/profile', authMiddleware, deleteProfile);

// @route   POST /api/users/:id/follow
router.post('/:id/follow', authMiddleware, followUser);

// @route   POST /api/users/:id/unfollow
router.post('/:id/unfollow', authMiddleware, unfollowUser);

// @route   GET /api/users/search?q=term
router.get('/search', searchUsers);

// @route   GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;