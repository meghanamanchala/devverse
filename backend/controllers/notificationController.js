const Notification = require('../models/Notification');
const User = require('../models/User');

// Get notifications for a user by Clerk ID
exports.getNotificationsByClerkId = async (req, res, next) => {
	try {
		const clerkId = req.params.clerkId;
		const user = await User.findOne({ clerkId });
		if (!user) return res.status(404).json({ success: false, message: 'User not found' });
		const notifications = await Notification.find({ user: user._id }).sort({ createdAt: -1 });
		res.json({ success: true, notifications });
	} catch (err) {
		next(err);
	}
};