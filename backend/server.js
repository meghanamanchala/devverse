const dotenv = require("dotenv");
dotenv.config();

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

// --- Express App Setup ---
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handler
app.use(errorHandler);

// --- Socket.io Setup (basic, to expand) ---
const http = require("http");
const { Server } = require("socket.io");
const chatSocket = require("./socket/chatSocket");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});
chatSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


