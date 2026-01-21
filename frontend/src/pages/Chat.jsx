import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import ChatInput from "../components/ChatInput";
import useSocket from "../socket/useSocket";
import socket from "../socket/socket";
import { useAuth } from "../context/useAuth";
import { logoutUser } from "../services/authService";
import { BsFillPersonFill } from "react-icons/bs";
import { ThreeDot } from "react-loading-indicators";

const Chat = () => {
  const { user, loading, setUser } = useAuth();
  const [messages, setMessages] = useState({});
  const [activeUser, setActiveUser] = useState(null);
  const navigate = useNavigate();

  useSocket();

  useEffect(() => {
    if (loading || !user) return;

    if (!socket.connected) {
      socket.auth = {
        userId: user._id,
        username: user.username,
      };
      socket.connect();
    }

    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, [user, loading]);

  useEffect(() => {
    const handlePrivateMessage = (msg) => {
      const otherUserId =
        msg.senderId === user._id
          ? activeUser
          : msg.senderId;

      if (!otherUserId) return;

      setMessages((prev) => ({
        ...prev,
        [otherUserId]: [...(prev[otherUserId] || []), msg],
      }));
    };

    socket.on("private-message", handlePrivateMessage);

    return () => {
      socket.off("private-message", handlePrivateMessage);
    };
  }, [activeUser, user]);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    socket.disconnect();
    navigate("/login");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><ThreeDot /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <main className="m-2 flex h-screen gap-2">
      <Sidebar onSelectUser={setActiveUser} activeUser={activeUser} />

      <div className="flex flex-col w-full h-[96vh] border rounded-2xl shadow-md p-3">
        <nav className="flex justify-between items-center font-bold text-xl shadow-sm p-3 rounded-lg">
          <div className="flex gap-2 items-center">
            <BsFillPersonFill size={24} />
            <h1>{activeUser || "Select a user"}</h1>
          </div>

          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded-xl">
            Logout
          </button>
        </nav>

        <ChatBox
          messages={messages[activeUser] || []}
          currentUserId={user._id}
        />

        <ChatInput activeUser={activeUser} />
      </div>
    </main>
  );
};

export default Chat;
