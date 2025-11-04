// User routes
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/users/profile
router.get('/profile', authMiddleware, getProfile);

// @route   PUT /api/users/profile
router.put('/profile', authMiddleware, updateProfile);

// @route   DELETE /api/users/profile
router.delete('/profile', authMiddleware, deleteProfile);

module.exports = router;