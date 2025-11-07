const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		clerkId: { type: String, required: true, unique: true },
		username: { type: String },
		name: { type: String },
		email: { type: String, required: true, unique: true },
		followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		skills: [{ type: String }],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
