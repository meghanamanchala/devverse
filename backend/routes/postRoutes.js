// Post routes
const express = require('express');
const router = express.Router();
const { 
    createPost, 
    getPosts, 
    getPost, 
    updatePost, 
    deletePost, 
    likePost, 
    unlikePost, 
    addComment, 
    deleteComment, 
    searchPosts
} = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/posts
router.post('/', authMiddleware, createPost);

// @route   GET /api/posts
router.get('/', getPosts);

// @route   GET /api/posts/search?q=term
router.get('/search', searchPosts);

// @route   GET /api/posts/:id
router.get('/:id', getPost);

// @route   PUT /api/posts/:id
router.put('/:id', authMiddleware, updatePost);

// @route   DELETE /api/posts/:id
router.delete('/:id', authMiddleware, deletePost);

// @route   POST /api/posts/:id/like
router.post('/:id/like', authMiddleware, likePost);

// @route   POST /api/posts/:id/unlike
router.post('/:id/unlike', authMiddleware, unlikePost);

// @route   POST /api/posts/:id/comments
router.post('/:id/comments', authMiddleware, addComment);

// @route   DELETE /api/posts/:id/comments/:commentId
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment);

// @route   GET /api/posts/search?q=term
router.get('/search', searchPosts);

module.exports = router;