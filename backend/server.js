const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
connectDB();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const saveRoutes = require("./routes/saveRoutes");


const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


const app = express();

app.use(helmet());
app.use(morgan("dev"));


const allowedOrigins = [
  "https://devverse-psi.vercel.app", // Vercel frontend
  "http://localhost:5173" // Local development
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ REQUIRED for multer + clerk

app.use(cookieParser());

// ✅ ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/save", saveRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);


// --- SOCKET.IO SETUP ---
const http = require('http');
const { Server } = require('socket.io');
const chatSocket = require('./socket/chatSocket');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

chatSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server & Socket.IO running on port ${PORT}`));
