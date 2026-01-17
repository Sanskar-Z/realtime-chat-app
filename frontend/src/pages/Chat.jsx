import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import ChatInput from "../components/ChatInput";
import useSocket from "../socket/useSocket";
import socket from "../socket/socket";
import { useAuth } from "../context/useAuth";
import { logoutUser } from "../services/authService";
import { IoPersonSharp } from "react-icons/io5";

const Chat = () => {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();

  // ✅ Register socket listeners (no connect here)
  useSocket();

  // ✅ Connect socket AFTER auth
  useEffect(() => {
    if (loading || !user) return;

    if (!socket.connected) {
      socket.auth = {
        userId: user._id,
        username: user.username,
      };
      socket.connect();
    }

    // cleanup ONLY on unmount
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [user, loading]);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    socket.disconnect();
    navigate("/login");
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <main className="m-2 flex justify-center items-center h-screen gap-2">
      <Sidebar />

      <div className="p-3 flex flex-col w-full h-[96vh] border border-gray-200 shadow-md rounded-2xl">
        <nav className="p-3 flex justify-between items-center font-bold text-xl shadow-sm rounded-lg">
          <div className="flex justify-between items-center font-bold text-xl gap-2">
            <span className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
              <IoPersonSharp size={20} color="gray"/>
            </span>

            <h1>{user.username}</h1>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded-md active:bg-red-600"
          >
            Logout
          </button>
        </nav>

        <ChatBox />
        <ChatInput />
      </div>
    </main>
  );
};

export default Chat;
