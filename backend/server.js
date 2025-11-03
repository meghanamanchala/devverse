const dotenv = require("dotenv");
dotenv.config();


// --- MongoDB Connection Test ---
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("MongoDB connection: SUCCESS"))
	.catch((err) => console.error("MongoDB connection: FAILED", err.message));

// --- Cloudinary Credentials Test ---
const cloudinary = require("cloudinary").v2;
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});
cloudinary.api.ping()
	.then(() => console.log("Cloudinary credentials: SUCCESS"))
	.catch((err) => console.error("Cloudinary credentials: FAILED", err.message));

// --- JWT Secret Test ---
const jwt = require("jsonwebtoken");
try {
	const token = jwt.sign({ test: "jwt" }, process.env.JWT_SECRET, { expiresIn: "1m" });
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	console.log("JWT secret: SUCCESS");
} catch (err) {
	console.error("JWT secret: FAILED", err.message);
}
