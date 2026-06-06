import axios from "axios";
import { getAccessToken } from "./authService";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

// Attach access token to every request via Authorization header
// This avoids cross-origin cookie issues in production
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;