
import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";

let socketInstance = null;

export const useSocket = () => {
	const socketRef = useRef();
	const user = useSelector((state) => state.auth.user);

	useEffect(() => {
		if (!socketInstance) {
			socketInstance = io("http://localhost:5000");
		}
		socketRef.current = socketInstance;
		// Join the user's room for private messaging
		if (user?._id) {
			socketInstance.emit("join", user._id);
		}
		return () => {
			// Optionally disconnect on unmount
			// socketRef.current.disconnect();
		};
	}, [user?._id]);

	return socketRef.current;
};
