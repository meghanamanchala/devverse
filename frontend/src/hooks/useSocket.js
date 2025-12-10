
import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";


let socketInstance = null;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocket = () => {
	const socketRef = useRef();
	const user = useSelector((state) => state.auth.user);


	useEffect(() => {
		if (!socketInstance) {
			socketInstance = io(SOCKET_URL);
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
