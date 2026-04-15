import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { getCurrentUser, refreshAccessToken } from "../services/authService";

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

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
