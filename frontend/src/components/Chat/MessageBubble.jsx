import React from "react";

const MessageBubble = ({ message, isOwn, read }) => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: isOwn ? "flex-end" : "flex-start",
				marginBottom: "0.5rem",
			}}
		>
			<div
				style={{
					background: isOwn ? "#DCF8C6" : "#FFF",
					color: "#222",
					padding: "0.75rem 1rem",
					borderRadius: "1rem",
					maxWidth: "70%",
					boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
				}}
			>
				<span>{message.text}</span>
			</div>
			<div style={{ fontSize: "0.75rem", color: "gray", marginTop: "2px" }}>
				{message.createdAt
					? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
					: ""}
				{isOwn && read && <span style={{ marginLeft: "8px", color: "#4caf50" }}>Read</span>}
			</div>
		</div>
	);
};

export default MessageBubble;
