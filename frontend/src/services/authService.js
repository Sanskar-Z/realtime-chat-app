import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api/v1/users";


export const registerUser = async (fullName, email, username, password) => {
    try {
        const response = await axios.post(
            `${API_URL}/register`,
            {
                fullName,
                email,
                username,
                password,
            },
            {
                withCredentials: true,
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Register error:",
            error.response?.data || error.message
        );
        throw error;
    }
}


export const loginUser = async (identifier, password) => {
    try {
        const response = await axios.post(
            `${API_URL}/login`,
            {
                username: identifier,
                email: identifier,
                password,
            },
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error) {
        console.log("Login error:", error.response?.data || error.message)
        throw error
    }
}