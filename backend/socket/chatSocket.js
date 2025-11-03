// Socket.io chat logic
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // Add more socket event handlers here
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};