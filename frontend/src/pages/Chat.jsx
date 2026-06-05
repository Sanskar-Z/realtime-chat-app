import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";
import { Navigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ConversationList from "../components/ConversationList";
import { fetchPrivateMessages } from "../services/messageService";
import { useAuth } from "../context/useAuth";
import { BsCheck2, BsCheck2All } from "react-icons/bs";
import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi";
import { ThreeDot } from "react-loading-indicators";
import chatIcon from "../images/SwiftChat.png";

// Avatar initials 
const Avatar = ({ username = "", size = "md", online = false }) => {
  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center select-none`}
      >
        {initials || "?"}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
      )}
    </div>
  );
};

// Message bubble 
const Message = ({ senderId, currentUserId, message, createdAt, read }) => {
  const isMe = senderId === currentUserId;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          relative px-4 py-2.5 rounded-2xl max-w-[62%] text-sm leading-relaxed
          ${isMe
            ? "bg-blue-500 text-white rounded-br-sm shadow-sm shadow-blue-200"
            : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm"
          }
        `}
      >
        <p className="whitespace-pre-wrap">{message}</p>
        <div
          className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"
            }`}
        >
          <span
            className={`text-[10px] tabular-nums ${isMe ? "text-blue-100" : "text-gray-400"
              }`}
          >
            {new Date(createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isMe &&
            (read ? (
              <BsCheck2All size={13} className="text-white opacity-80" title="Read" />
            ) : (
              <BsCheck2 size={13} className="text-blue-200" title="Sent" />
            ))}
        </div>
      </div>
    </div>
  );
};

// Date divider 
const DateDivider = ({ label }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-gray-200" />
    <span className="text-[11px] text-gray-400 font-medium px-2">{label}</span>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

// Message list 
const ChatBox = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-5 space-y-2"
      style={{ background: "#F7F8FA" }}
    >
      {/* subtle dot-grid pattern via CSS */}
      <style>{`
        .chat-bg {
          background-color: #F7F8FA;
          background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
          background-size: 24px 24px;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-enter { animation: fadeSlideIn 0.18s ease-out both; }
        .typing-dot {
          animation: typingBounce 1.2s infinite ease-in-out;
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-4px); }
        }
      `}</style>

      {messages.map((msg, index) =>
        msg.type === "system" ? (
          <DateDivider key={msg._id || index} label={msg.message} />
        ) : (
          <div key={msg._id || index} className="msg-enter">
            <Message
              senderId={msg.senderId || msg.sender}
              currentUserId={currentUserId}
              message={msg.message}
              createdAt={msg.createdAt}
              read={msg.read}
            />
          </div>
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
};

// Input bar 
const ChatInput = ({ activeUser }) => {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const emitTypingStop = () => {
    if (!activeUser) return;
    socket.emit("typing-stop", { toUserId: activeUser._id });
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (!activeUser || !socket.connected) return;

    socket.emit("typing-start", { toUserId: activeUser._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(emitTypingStop, 2000);
  };

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
    socket.emit("private-message", { toUserId: activeUser._id, message: text });
    setText("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 px-4 py-3">
      <form
        onSubmit={send}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-150 ${activeUser
          ? "bg-gray-50 border-gray-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm focus-within:shadow-blue-100"
          : "bg-gray-50 border-gray-200 opacity-60"
          }`}
      >
        <button
          type="button"
          tabIndex={-1}
          className="text-gray-400 hover:text-blue-500 transition-colors p-0.5"
          title="Attach file"
        >
          <FiPaperclip size={18} />
        </button>

        <button
          type="button"
          tabIndex={-1}
          className="text-gray-400 hover:text-amber-400 transition-colors p-0.5"
          title="Emoji"
        >
          <FiSmile size={18} />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={text}
          disabled={!activeUser}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={activeUser ? "Type a message…" : "Select a conversation to start chatting"}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none min-w-0"
        />

        <button
          type="submit"
          disabled={!text.trim() || !activeUser}
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 ${text.trim() && activeUser
            ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm shadow-blue-200 scale-100"
            : "bg-blue-100 text-blue-300 cursor-not-allowed"
            }`}
        >
          <FiSend size={15} className={text.trim() && activeUser ? "translate-x-px" : ""} />
        </button>
      </form>
    </footer>
  );
};

// Typing indicator bubble 
const TypingBubble = () => (
  <div className="flex justify-start px-6 pb-2">
    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="typing-dot w-1.5 h-1.5 rounded-full bg-blue-400 block"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  </div>
);

// Empty state 
const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center select-none gap-4">
    <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center shadow-inner">
      <img src={chatIcon} alt="SwiftChat" className="w-14 h-14 object-contain" />
    </div>
    <div className="text-center">
      <h3 className="text-gray-700 font-semibold text-lg mb-1">Your conversations</h3>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
        Select a contact from the list to start a conversation
      </p>
    </div>
  </div>
);

// Main Chat page 
const Chat = () => {
  const { user, loading } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState({});
  const [activeUser, setActiveUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const formatLastSeen = (date) => {
    if (!date) return "Offline";
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "Active just now";
    if (diff < 3600) return `Active ${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `Active ${Math.floor(diff / 3600)}h ago`;
    return `Active ${Math.floor(diff / 86400)}d ago`;
  };

  useEffect(() => {
    const handle = (users) => { setOnlineUsers(users); setUsersLoading(false); };
    socket.on("online-users", handle);
    socket.emit("get-online-users");
    return () => socket.off("online-users", handle);
  }, []);

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

  useEffect(() => {
    const handle = (msg) => { if (activeUser?._id) addMessage(activeUser._id, msg); };
    socket.on("message-sent", handle);
    return () => socket.off("message-sent", handle);
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser) return;
    fetchPrivateMessages(activeUser?._id)
      .then((data) => {
        const history = Array.isArray(data) ? data : [];
        setMessages((prev) => {
          const existing = prev[activeUser?._id] || [];
          const seen = new Set(existing.map((m) => m._id?.toString()));
          const fresh = history.filter((m) => !seen.has(m._id?.toString()));
          return { ...prev, [activeUser._id]: [...fresh, ...existing] };
        });
      })
      .catch((err) => console.error("Failed to load messages:", err));
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser?._id) return;
    socket.emit("message-read", { fromUserId: activeUser?._id });
  }, [activeUser]);

  useEffect(() => {
    const handle = ({ byUserId }) => {
      setMessages((prev) => {
        const convo = prev[byUserId];
        if (!convo) return prev;
        return { ...prev, [byUserId]: convo.map((m) => ({ ...m, read: true })) };
      });
    };
    socket.on("messages-read", handle);
    return () => socket.off("messages-read", handle);
  }, []);

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
      setIsTyping(false);
    };
  }, [activeUser]);

  const addMessage = (userId, msg) => {
    setMessages((prev) => {
      const existing = prev[userId] || [];
      if (existing.some((m) => m._id?.toString() === msg._id?.toString())) return prev;
      return { ...prev, [userId]: [...existing, msg] };
    });
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <img src={chatIcon} alt="SwiftChat" className="w-8 h-8 object-contain" />
          </div>
          <ThreeDot color="#3B82F6" size="small" />
        </div>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  const activeUserObj = onlineUsers.find((u) => u.userId === activeUser?._id);
  const isActiveUserOnline = activeUserObj !== undefined;

  return (
    <main className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <ConversationList
        onlineUsers={onlineUsers}
        activeUser={activeUser}
        onSelectUser={setActiveUser}
        currentUserId={user._id}
        usersLoading={usersLoading}
      />

      {/* Chat panel */}
      <section className="flex-1 flex flex-col min-w-0 bg-white">
        {activeUser ? (
          <>
            {/* ── Chat header ── */}
            <header className="h-[65px] flex-shrink-0 bg-white border-b border-gray-100 flex items-center px-5 gap-3 select-none">
              <Avatar
                username={activeUser?.username}
                size="md"
                online={isActiveUserOnline}
              />

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 text-[15px] leading-tight truncate">
                  {activeUser?.username || "User"}
                </h2>

                {isTyping ? (
                  <p className="text-xs text-blue-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="flex gap-0.5 items-center">
                      {[0, 120, 240].map((d) => (
                        <span
                          key={d}
                          className="typing-dot w-1 h-1 rounded-full bg-blue-400 block"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </span>
                    typing…
                  </p>
                ) : (
                  <p
                    className={`text-xs mt-0.5 font-medium ${isActiveUserOnline ? "text-emerald-500" : "text-gray-400"
                      }`}
                  >
                    {isActiveUserOnline ? "Online" : formatLastSeen(activeUser.lastSeen)}
                  </p>
                )}
              </div>
            </header>

            {/* ── Messages ── */}
            <div className="flex-1 flex flex-col overflow-hidden chat-bg">
              <ChatBox
                messages={messages[activeUser?._id] || []}
                currentUserId={user._id}
              />
              {isTyping && <TypingBubble />}
            </div>

            <ChatInput activeUser={activeUser} />
          </>
        ) : (
          <div className="flex-1 flex flex-col bg-gray-50">
            <EmptyState />
          </div>
        )}
      </section>

      {/* Global animation keyframes */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-4px); }
        }
        .typing-dot { animation: typingBounce 1.2s infinite ease-in-out; }

        .chat-bg {
          background-color: #F7F8FA;
          background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </main>
  );
};

export default Chat;