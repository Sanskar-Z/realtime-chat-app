import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";
import { Navigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ConversationList from "../components/ConversationList";
import { fetchPrivateMessages } from "../services/messageService";
import { useAuth } from "../context/useAuth";
import { BsFillPersonFill } from "react-icons/bs";
import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi";
import { ThreeDot } from "react-loading-indicators";
import chatIcon from "../images/ChatAPP.png";


// ─── Message bubble ────────────────────────────────────────────────────────────
const Message = ({ senderId, currentUserId, message, createdAt }) => {
  const isMe = senderId === currentUserId;
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}>
      <div
        className={`px-4 py-2 rounded-2xl max-w-[65%] text-sm shadow-sm
          ${isMe
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-white border border-gray-200 rounded-bl-none"
          }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message}</p>
        <div className={`text-[10px] mt-1 ${isMe ? "text-blue-100 text-right" : "text-gray-400"}`}>
          {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};

// ─── Message list ──────────────────────────────────────────────────────────────
const ChatBox = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
      {messages.map((msg, index) =>
        msg.type === "system" ? (
          <div key={msg._id || index} className="text-center text-xs text-gray-400">
            {msg.message}
          </div>
        ) : (
          <Message
            key={msg._id || index}
            senderId={msg.senderId || msg.sender}
            currentUserId={currentUserId}
            message={msg.message}
            createdAt={msg.createdAt}
          />
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
};

// ─── Input bar ─────────────────────────────────────────────────────────────────
const ChatInput = ({ activeUser, onSend }) => {
  const [text, setText] = useState("");

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket.connected || !activeUser) return;
    socket.emit("private-message", { toUserId: activeUser, message: text });
    setText("");
  };

  return (
    <footer className="p-4 bg-white border-t border-gray-100">
      <form
        onSubmit={send}
        className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 shadow-inner"
      >
        <button type="button" className="text-gray-400 hover:text-blue-500 transition">
          <FiPaperclip size={20} />
        </button>
        <button type="button" className="text-gray-400 hover:text-blue-500 transition">
          <FiSmile size={20} />
        </button>
        <input
          type="text"
          value={text}
          disabled={!activeUser}
          onChange={(e) => setText(e.target.value)}
          placeholder={activeUser ? "Type a message..." : "Select a user to start chatting"}
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition disabled:opacity-40"
        >
          <FiSend size={18} />
        </button>
      </form>
    </footer>
  );
};

// ─── Main Chat page ────────────────────────────────────────────────────────────
const Chat = () => {
  const { user, loading } = useAuth();

  const [messages, setMessages] = useState({});  // { userId: Message[] }
  const [activeUser, setActiveUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Online users list
  useEffect(() => {
    const handle = (users) => { setOnlineUsers(users); setUsersLoading(false); };
    socket.on("online-users", handle);
    socket.emit("get-online-users");
    return () => socket.off("online-users", handle);
  }, []);

  // Incoming messages from other users
  useEffect(() => {
    if (!user?._id) return;

    const handle = (msg) => {
      if (!msg) return;
      const chatUserId = msg.senderId === user._id ? msg.receiverId : msg.senderId;
      if (!chatUserId) return;
      addMessage(chatUserId, msg);
    };

    socket.on("private-message", handle);
    return () => socket.off("private-message", handle);
  }, [user]);

  // Acknowledgement for messages we sent (avoids echoing via private-message)
  useEffect(() => {
    const handle = (msg) => { if (activeUser) addMessage(activeUser, msg); };
    socket.on("message-sent", handle);
    return () => socket.off("message-sent", handle);
  }, [activeUser]);

  // Load history when switching conversations
  useEffect(() => {
    if (!activeUser) return;

    fetchPrivateMessages(activeUser)
      .then((data) => {
        const history = Array.isArray(data) ? data : [];
        setMessages((prev) => {
          // Merge: keep socket messages already in state, deduplicate by _id
          const existing = prev[activeUser] || [];
          const seen = new Set(existing.map((m) => m._id?.toString()));
          const fresh = history.filter((m) => !seen.has(m._id?.toString()));
          return { ...prev, [activeUser]: [...fresh, ...existing] };
        });
      })
      .catch((err) => console.error("Failed to load messages:", err));
  }, [activeUser]);

  // Helper: append a message, deduplicating by _id
  const addMessage = (userId, msg) => {
    setMessages((prev) => {
      const existing = prev[userId] || [];
      if (existing.some((m) => m._id?.toString() === msg._id?.toString())) return prev;
      return { ...prev, [userId]: [...existing, msg] };
    });
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <ThreeDot />
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  const activeUserObj = onlineUsers.find((u) => u.userId === activeUser);

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

      <section className="flex-1 flex flex-col bg-gray-50">
        {activeUser ? (
          <>
            <header className="h-20 bg-white border-b border-gray-100 flex items-center px-8">
              <span className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                <BsFillPersonFill />
              </span>
              <div className="ml-4">
                <h2 className="font-bold text-lg">{activeUserObj?.username || "User"}</h2>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </header>

            <ChatBox messages={messages[activeUser] || []} currentUserId={user._id} />

            <ChatInput activeUser={activeUser} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 select-none">
            <img src={chatIcon} alt="chat" className="w-50 h-50 object-contain mb-4" />
            <p className="text-xl">Select a user to start chatting</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Chat;