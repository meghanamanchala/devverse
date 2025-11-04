// User routes
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteProfile, followUser, unfollowUser } = require('../controllers/userController');
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

module.exports = router;