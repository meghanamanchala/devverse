const Message = require('../models/Message');

// Socket.io chat logic
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join user to their own room for private messaging
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    // Handle sending a message
    socket.on('sendMessage', async ({ sender, receiver, text }) => {
      // Save message to DB
      const message = await Message.create({ sender, receiver, text });
      // Emit to both sender and receiver for instant update
      io.to(sender).emit('receiveMessage', message);
      io.to(receiver).emit('receiveMessage', message);

      // Create notification for receiver
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      const receiverUser = await User.findOne({ clerkId: receiver });
      if (receiverUser) {
        await Notification.create({
          user: receiverUser._id,
          type: 'message',
          message: `You received a new message!`,
          isRead: false
        });
      }
    });

    // Handle sending a notification
    socket.on('sendNotification', ({ receiver, notification }) => {
      io.to(receiver).emit('receiveNotification', notification);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Optionally handle user disconnect
    });
  });
};