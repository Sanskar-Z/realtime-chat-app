import api from "./api";

// In-memory token storage — avoids cross-origin cookie issues
let accessToken = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => { accessToken = token; };

export const registerUser = async (fullName, email, username, password) => {
    try {
        const response = await api.post("/users/register", {
            fullName,
            email,
            username,
            password,
        });
        alert(response.data.message);
        return response.data;
    } catch (error) {
        console.error("Register error:", error.response?.data || error.message);
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
        // Store access token in memory
        accessToken = response.data.data.accessToken;
        alert(response.data.message);
        return response.data;
    } catch (error) {
        console.log("Login error:", error.response?.data || error.message);
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
        accessToken = null; // Clear token on logout
        alert(response.data.message);
    } catch (error) {
        alert(error.response?.data.message);
    }
};

export const updateUserDetails = async (userData) => {
    try {
        const response = await api.patch("/users/update-user", userData);
        alert(response.data.message);
        return response.data;
    } catch (error) {
        alert(error.response?.data.message);
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
        alert(response.data.message);
        return response.data;
    } catch (error) {
        alert(error.response?.data.message);
        throw error;
    }
};

export const refreshAccessToken = async () => {
    try {
        const response = await api.post("/users/refresh-token");
        // Update token in memory
        accessToken = response.data.data.accessToken;
        return response.data;
    } catch (error) {
        throw error;
    }
};