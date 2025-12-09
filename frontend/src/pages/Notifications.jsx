import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../app/api";
import NotificationItem from "../components/Notification/NotificationItem";

const Notifications = () => {
	const [notifications, setNotifications] = useState([]);
	const user = useSelector((state) => state.auth.user);

	useEffect(() => {
		async function fetchNotifications() {
			if (!user?.clerkId) return;
			try {
				const res = await api.get(`/notifications/${user.clerkId}`);
				setNotifications(res.data.notifications || []);
			} catch (err) {
				setNotifications([]);
			}
		}
		fetchNotifications();
	}, [user]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#0b1628] to-[#0d1b33] text-white p-8">
			<h2 className="text-2xl font-bold mb-6">Notifications</h2>
			<div className="space-y-4">
				{notifications.length === 0 ? (
					<div className="text-gray-400">No notifications yet.</div>
				) : (
					notifications.map((notif) => (
						<NotificationItem key={notif._id} notification={notif} />
					))
				)}
			</div>
		</div>
	);
};

export default Notifications;
