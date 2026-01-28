import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/messages";

export const fetchPrivateMessages = async (userId) => {
    const res = await axios.get(`${API}/private/${userId}`, {
        withCredentials: true,
    });

    return res.data;
}