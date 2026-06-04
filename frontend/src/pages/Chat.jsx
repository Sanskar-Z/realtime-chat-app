import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";
import { Navigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ConversationList from "../components/ConversationList";
import { fetchPrivateMessages } from "../services/messageService";
import { useAuth } from "../context/useAuth";
import { BsFillPersonFill, BsCheck2, BsCheck2All } from "react-icons/bs";
import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi";
import { ThreeDot } from "react-loading-indicators";
import chatIcon from "../images/SwiftChat.png";

// ─── Message bubble ────────────────────────────────────────────────────────────
const Message = ({ senderId, currentUserId, message, createdAt, read }) => {
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
        <div className={`text-[10px] mt-1 flex items-center ${isMe ? "text-blue-100 text-right" : "text-gray-400"}`}>
          {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {isMe && (
            read
              ? <BsCheck2All size={13} className="text-white opacity-90" title="Read" />
              : <BsCheck2 size={13} className="text-blue-200" title="Sent" />
          )}
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
            read={msg.read}
          />
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
};

// ─── Input bar ─────────────────────────────────────────────────────────────────
const ChatInput = ({ activeUser }) => {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);

  const emitTypingStop = () => {
    if (!activeUser) return;
    socket.emit("typing-stop", { toUserId: activeUser._id })
  };

  const handleChange = (e) => {
    setText(e.target.value);

    if (!activeUser || !socket.connected) return;

    socket.emit("typing-start", { toUserId: activeUser._id })

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(emitTypingStop, 2000);
  }
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const send = (e) => {
    e?.preventDefault();

    if (!text.trim() || !socket.connected || !activeUser) return;

    clearTimeout(typingTimeoutRef.current);
    emitTypingStop();

    socket.emit("private-message", {
      toUserId: activeUser._id,
      message: text,
    });

    setText("");
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);


  return (
    <footer className="border-t border-gray-200 bg-white px-3 py-2">
      <form
        onSubmit={send}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:border-blue-300"
      >
        {/* Attachment */}
        <button
          type="button"
          className="text-gray-500 transition hover:text-blue-500"
        >
          <FiPaperclip size={18} />
        </button>

        {/* Emoji */}
        <button
          type="button"
          className="text-gray-500 transition hover:text-yellow-500"
        >
          <FiSmile size={18} />
        </button>

        {/* Input */}
        <input
          type="text"
          value={text}
          disabled={!activeUser}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            activeUser
              ? "Type a message..."
              : "Select a user to start chatting"
          }
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
        />

        {/* Send */}
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white transition hover:bg-blue-600 disabled:opacity-40"
        >
          <FiSend size={15} />
        </button>
      </form>
    </footer>
  );
};

// ─── Main Chat page ────────────────────────────────────────────────────────────
const Chat = () => {
  const { user, loading } = useAuth();
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState({});  // { userId: Message[] }
  const [activeUser, setActiveUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const formatLastSeen = (date) => {
    if (!date) return "Offline";
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

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
    const handle = (msg) => { if (activeUser?._id) addMessage(activeUser._id, msg); };
    socket.on("message-sent", handle);
    return () => socket.off("message-sent", handle);
  }, [activeUser]);

  // Load history when switching conversations
  useEffect(() => {
    if (!activeUser) return;

    fetchPrivateMessages(activeUser?._id)
      .then((data) => {
        const history = Array.isArray(data) ? data : [];
        setMessages((prev) => {
          // Merge: keep socket messages already in state, deduplicate by _id
          const existing = prev[activeUser?._id] || [];
          const seen = new Set(existing.map((m) => m._id?.toString()));
          const fresh = history.filter((m) => !seen.has(m._id?.toString()));
          return { ...prev, [activeUser._id]: [...fresh, ...existing] };
        });
      })
      .catch((err) => console.error("Failed to load messages:", err));
  }, [activeUser]);


  //When receiver opens a conversation — emit message-read to backend
  useEffect(() => {
    if (!activeUser?._id) return;
    socket.emit("message-read", { fromUserId: activeUser?._id })
  }, [activeUser])


  useEffect(() => {
    const handle = ({ byUserId }) => {
      setMessages((prev) => {
        const convo = prev[byUserId]
        if (!convo) return prev
        return {
          ...prev,
          [byUserId]: convo.map((m) => ({ ...m, read: true }))
        }
      })
    }
    socket.on("messages-read", handle)
    return () => socket.off("messages-read", handle)
  }, [])

  useEffect(() => {
    const onStart = ({ fromUserId }) => {
      if (fromUserId === activeUser?._id) setIsTyping(true);
    };
    const onStop = ({ fromUserId }) => {
      if (fromUserId === activeUser?._id) setIsTyping(false);
    };

    socket.on("typing-start", onStart);
    socket.on("typing-stop", onStop);
    return () => {
      socket.off("typing-start", onStart);
      socket.off("typing-stop", onStop);
      setIsTyping(false); // reset when switching conversations
    };
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

  const activeUserObj = onlineUsers.find((u) => u.userId === activeUser?._id);
  const isActiveUserOnline = activeUserObj !== undefined;

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
            <header className="h-20 bg-white border-b border-gray-100 flex items-center px-8 select-none">
              <span className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                <BsFillPersonFill />
              </span>
              <div className="ml-4">
                <h2 className="font-bold text-lg">{activeUser?.username || "User"}</h2>
                {isTyping ? (
                  <p className="text-xs text-blue-400 flex items-center gap-1">
                    <span>typing</span>
                    <span className="flex gap-0.5 items-end">
                      <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </p>
                ) : (
                  <p className={`text-xs ${isActiveUserOnline ? "text-green-500" : "text-gray-400"}`}>
                    {isActiveUserOnline ? "Online" : formatLastSeen(activeUser.lastSeen)}
                  </p>
                )}
              </div>
            </header>

            <ChatBox messages={messages[activeUser?._id] || []} currentUserId={user._id} />

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