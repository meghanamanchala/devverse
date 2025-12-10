// api.js
import axios from "axios";

const LOCAL_BACKEND_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: import.meta.env.BACKEND_API_URL || LOCAL_BACKEND_URL,
  withCredentials: true,
});

export default api;
