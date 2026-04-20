import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ConversationList from "../components/ConversationList";
import ChatBox from "../components/ChatBox";
import ChatInput from "../components/ChatInput";
import useSocket from "../socket/useSocket";
import socket from "../socket/socket";
import { useAuth } from "../context/useAuth";
import { BsFillPersonFill } from "react-icons/bs";
import { ThreeDot } from "react-loading-indicators";
import chatIcon from "../images/ChatAPP.png";

const Chat = () => {
  const { user, loading } = useAuth();

  const [messages, setMessages] = useState({});
  const [activeUser, setActiveUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useSocket();

  // ONLINE USERS
  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
      setUsersLoading(false);
    }

    socket.on("online-users", handleOnlineUsers);

    socket.emit("get-online-users");

    return () => socket.off("online-users", handleOnlineUsers);
  }, []);


  // PRIVATE MESSAGE
  useEffect(() => {
    if (!user?._id) return;

    const handlePrivateMessage = (msg) => {
      if (!msg) return;

      const chatUserId =
        msg.senderId === user._id ? msg.receiverId : msg.senderId;

      if (!chatUserId) return;

      setMessages((prev) => ({
        ...prev,
        [chatUserId]: [...(prev[chatUserId] || []), msg],
      }));
    };

    socket.on("private-message", handlePrivateMessage);

    return () => socket.off("private-message", handlePrivateMessage);
  }, [user]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <ThreeDot />
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  const activeUserObj = onlineUsers.find(
    (u) => u.userId === activeUser
  );

  return (
    <main className="flex h-screen bg-gray-100">

      <Sidebar />

      <ConversationList
        onlineUsers={onlineUsers}
        activeUser={activeUser}
        onSelectUser={setActiveUser}
        currentUserId={user._id}
        usersLoading={usersLoading}
      />

      {/* Chat window */}

      <section className="flex-1 flex flex-col bg-gray-50">

        {activeUser ? (
          <>
            {/* Header */}

            <header className="h-20 bg-white border-b border-gray-100 flex items-center px-8">

              <span className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                <BsFillPersonFill />
              </span>

              <div className="ml-4">
                <h2 className="font-bold text-lg">
                  {activeUserObj?.username || "User"}
                </h2>

                <p className="text-xs text-green-500">Online</p>
              </div>
            </header>

            {/* Messages */}

            <ChatBox
              messages={messages[activeUser] || []}
              currentUserId={user._id}
              activeUser={activeUser}
            />

            {/* Input */}

            <ChatInput activeUser={activeUser} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 select-none">

            <div className="text-6xl mb-4">
              <img src={chatIcon} alt="chat" className="w-50 h-50 object-contain" />
            </div>

            <p className="text-xl">Select a user to start chatting</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Chat;