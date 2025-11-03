// User model schema
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	// Add more fields as needed (avatar, bio, etc.)
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
// User model schema