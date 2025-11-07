// Sidebar.jsx
import React from "react";

const Sidebar = () => {
		return (
			<aside className="sidebar w-full md:w-64 bg-gray-800 p-4 flex-shrink-0 border-r border-gray-700 min-h-[60px] md:min-h-screen shadow-lg md:rounded-r-xl fixed md:static top-0 left-0 h-16 md:h-auto z-20 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start">
				<div className="text-xl font-extrabold mb-0 md:mb-6 text-white tracking-wide">DevVerse</div>
				<nav className="flex flex-row md:flex-col gap-2 text-base font-medium w-full md:w-auto justify-end md:justify-start">
					<a href="/" className="hover:bg-blue-700 transition-colors rounded-lg px-4 py-2 text-white">Home</a>
					<a href="/explore" className="hover:bg-blue-700 transition-colors rounded-lg px-4 py-2 text-white">Explore</a>
					<a href="/network" className="hover:bg-blue-700 transition-colors rounded-lg px-4 py-2 text-white">Network</a>
					<a href="/messages" className="hover:bg-blue-700 transition-colors rounded-lg px-4 py-2 text-white">Messages</a>
					<a href="/notifications" className="hover:bg-blue-700 transition-colors rounded-lg px-4 py-2 text-white">Notifications</a>
					<a href="/saved" className="hover:bg-blue-700 transition-colors rounded-lg px-4 py-2 text-white">Saved</a>
					<a href="/profile" className="hover:bg-blue-700 transition-colors rounded-lg px-4 py-2 text-white">Profile</a>
					<a href="/settings" className="hover:bg-blue-700 transition-colors rounded-lg px-4 py-2 text-white">Settings</a>
				</nav>
			</aside>
		);
};

export default Sidebar;
