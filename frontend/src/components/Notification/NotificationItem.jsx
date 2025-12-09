import React from "react";

const typeToIcon = {
	like: "👍",
	comment: "💬",
	follow: "👤",
	message: "✉️",
};

const NotificationItem = ({ notification }) => {
	const { type, message, isRead, createdAt } = notification;
	return (
		<div
			className={`flex items-center gap-4 p-4 rounded-xl shadow-md bg-[#16223a]/80 border border-[#223a5e]/30 transition ${
				isRead ? "opacity-70" : ""
			}`}
		>
			<span className="text-2xl">{typeToIcon[type] || "🔔"}</span>
			<div className="flex-1">
				<div className="font-medium text-gray-100">{message}</div>
				<div className="text-xs text-gray-400 mt-1">
					{createdAt ? new Date(createdAt).toLocaleString() : ""}
				</div>
			</div>
			{!isRead && <span className="text-xs px-2 py-1 bg-blue-600 rounded text-white">New</span>}
		</div>
	);
};

export default NotificationItem;
