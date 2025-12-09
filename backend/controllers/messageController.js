const Message = require('../models/Message');

// Message controller logic

// Get all messages between two users
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;
    console.log("[getMessages] Clerk IDs:", { userId, otherUserId });
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    console.log("[getMessages] Found messages:", messages);
    res.json({ success: true, messages });
  } catch (err) {
    console.error("[getMessages] Error:", err);
    next(err);
  }
};