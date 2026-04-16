import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { getCurrentUser, refreshAccessToken } from "../services/authService";
import socket from "../socket/socket";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        try {
          await refreshAccessToken();
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (!socket.connected) {
        socket.auth = { userId: user._id, username: user.username };
        socket.connect();
      }
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }

    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
