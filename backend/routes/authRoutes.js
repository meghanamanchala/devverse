const express = require("express");
const router = express.Router();
const { saveUser } = require("../controllers/authController");

// ✅ POST /api/auth/save-user
router.post("/save-user", saveUser);

module.exports = router;
