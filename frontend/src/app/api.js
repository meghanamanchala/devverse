
import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:5000/api", // Change to your backend URL if needed
	withCredentials: true,
});

export default api;
