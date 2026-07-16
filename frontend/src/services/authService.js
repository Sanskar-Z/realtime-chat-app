import api from "./api";
import { toast } from "react-hot-toast";

// Token storage — persists across page refreshes
const TOKEN_KEY = "swiftchat_access_token";

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

export const setAccessToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
};

export const registerUser = async (fullName, email, username, password) => {
    try {
        const response = await api.post("/users/register", {
            fullName,
            email,
            username,
            password,
        });
        toast.success(response.data.message);
        return response.data;
    } catch (error) {
        console.error("Register error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Registration failed");
        throw error;
    }
};

export const loginUser = async (identifier, password) => {
    try {
        const response = await api.post("/users/login", {
            username: identifier,
            email: identifier,
            password,
        });
        // Persist token so user stays logged in after refresh
        setAccessToken(response.data.data.accessToken);
        toast.success(response.data.message);
        return response.data;
    } catch (error) {
        console.log("Login error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Login failed");
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await api.get("/users/current-user");
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const response = await api.post("/users/logout");
        setAccessToken(null); // Clear token on logout
        toast.success(response.data.message);
    } catch (error) {
        toast.error(error.response?.data?.message || "Logout failed");
    }
};

export const updateUserDetails = async (userData) => {
    try {
        const response = await api.patch("/users/update-user", userData);
        toast.success(response.data.message);
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update profile");
        throw error;
    }
};

export const updatePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
        const response = await api.patch("/users/update-password", {
            oldPassword,
            newPassword,
            confirmPassword
        });
        toast.success(response.data.message);
        return response.data;
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update password");
        throw error;
    }
};

export const refreshAccessToken = async () => {
    try {
        const response = await api.post("/users/refresh-token");
        // Update persisted token
        setAccessToken(response.data.data.accessToken);
        return response.data;
    } catch (error) {
        setAccessToken(null); // Clear if refresh fails
        throw error;
    }
};