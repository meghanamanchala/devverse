const Message = require('../models/Message');

// Message controller logic

// Get all messages between two users
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};