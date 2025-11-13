const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

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
  searchPosts,
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const upload = require("../middleware/uploadMiddleware");

// ✅ Order matters:
// 1. Auth checks token (authMiddleware)
// 2. Multer handles image (upload.single)
// 3. Validation
// 4. Controller

router.post(
  "/",
  (req, res, next) => {
    console.log("✅ Route hit: POST /api/posts");
    next();
  },
  authMiddleware,
  upload.single("image"),
  (req, res, next) => {
    console.log("✅ Multer finished. File:", req.file ? req.file.originalname : "No file");
    next();
  },
  [body("text").notEmpty().withMessage("Text is required")],
  validateRequest,
  createPost
);

router.get("/", getPosts);
router.get("/search", searchPosts);
router.get("/:id", getPost);
router.put("/:id", authMiddleware, upload.single("image"), updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/like", authMiddleware, likePost);
router.post("/:id/unlike", authMiddleware, unlikePost);
router.post("/:id/comments", authMiddleware, addComment);
router.delete("/:id/comments/:commentId", authMiddleware, deleteComment);

module.exports = router;
