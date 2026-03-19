import api from "./api"; // adjust path if needed

export const fetchPrivateMessages = async (userId) => {
    try {
        const res = await api.get(`/messages/private/${userId}`);
        return res.data;
    } catch (error) {
        console.error(
            "Fetch messages error:",
            error.response?.data || error.message
        );
        throw error;
    }
};