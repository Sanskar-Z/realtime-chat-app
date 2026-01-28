import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import ChatInput from "../components/ChatInput";
import useSocket from "../socket/useSocket";
import socket from "../socket/socket";
import { useAuth } from "../context/useAuth";
import { BsFillPersonFill } from "react-icons/bs";
import { ThreeDot } from "react-loading-indicators";
import ChatAPP from "../images/ChatAPP.png"

const Chat = () => {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState({});
  const [activeUser, setActiveUser] = useState(null);

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
      const chatUserId =
        msg.senderId === user._id
          ? msg.receiverId
          : msg.senderId;

      if (!chatUserId) return;

      setMessages((prev) => ({
        ...prev,
        [chatUserId]: [...(prev[chatUserId] || []), msg],
      }));
    };

    socket.on("private-message", handlePrivateMessage);

    return () => {
      socket.off("private-message", handlePrivateMessage);
    };
  }, [activeUser, user]);

  if (loading) return <div className="h-screen flex items-center justify-center"><ThreeDot /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <main className="m-2 flex gap-2">
      <Sidebar onSelectUser={setActiveUser} activeUser={activeUser} />

      <div className={`${activeUser ? 'hidden' : 'flex flex-col justify-center w-full items-center h-[96vh] rounded-2xl shadow-md p-3'}`}>
        <img src={ChatAPP} alt="Chat App" className="w-40 h-40" />
        <span className="text-md">Select a user</span>
      </div>

      <div className={`flex flex-col w-full h-[96vh] rounded-2xl shadow-md p-3 ${activeUser ? '' : 'hidden'}`}>
        <nav className="flex justify-between items-center font-bold text-xl shadow-sm p-3 rounded-lg">
          <div className="flex gap-2 items-center">
            <span className="bg-gray-100 rounded-4xl w-10 h-10 flex items-center justify-center">
              <BsFillPersonFill size={24} color="gray" />
            </span>

            <h1>{activeUser || "Select a user"}</h1>
          </div>
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
