import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import api from "../services/api";
import socket from "../socket/socket";

const formatLastSeen = (date) => {
  if (!date) return "Offline";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Initials avatar — consistent with Chat.jsx and SettingsForm.jsx
const Avatar = ({ username = "", online = false }) => {
  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex-shrink-0">
      <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex items-center justify-center select-none">
        {initials || "?"}
      </div>
      <span
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white transition-colors ${online ? "bg-emerald-400" : "bg-gray-300"
          }`}
      />
    </div>
  );
};

const ConversationList = ({
  onlineUsers = [],
  activeUser,
  onSelectUser,
  currentUserId,
  usersLoading,
  unreadCounts = {},
}) => {
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    api
      .get("/users")
      .then((res) => setAllUsers(res.data.data || []))
      .catch(() => setFetchError(true));
  }, []);

  useEffect(() => {
    const onStart = ({ fromUserId }) => setTypingUser({ fromUserId, isTyping: true });
    const onStop = ({ fromUserId }) => setTypingUser({ fromUserId, isTyping: false });
    socket.on("typing-start", onStart);
    socket.on("typing-stop", onStop);
    return () => {
      socket.off("typing-start", onStart);
      socket.off("typing-stop", onStop);
    };
  }, []);

  const onlineSet = new Set(onlineUsers.map((u) => u.userId));

  const users = allUsers
    .filter((u) => u._id !== currentUserId)
    .filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.fullName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aOnline = onlineSet.has(a._id);
      const bOnline = onlineSet.has(b._id);
      if (aOnline !== bOnline) return aOnline ? -1 : 1;
      return a.username.localeCompare(b.username);
    });

  return (
    <section className="w-[300px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col select-none">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <h1 className="text-[17px] font-bold text-gray-900 mb-3">Messages</h1>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 transition focus-within:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-200">
          <FiSearch size={14} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none min-w-0"
          />
        </div>
      </div>

      {/* ── Section label ── */}
      <div className="px-5 py-2 flex-shrink-0">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {search ? "Results" : "All Contacts"}
        </span>
      </div>

      {/* ── User list ── */}
      <div className="flex-1 overflow-y-auto">
        {usersLoading && allUsers.length === 0 ? (
          /* Skeleton */
          <div className="px-4 space-y-1 pt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3">
                <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full animate-pulse w-2/3" />
                  <div className="h-2.5 bg-gray-100 rounded-full animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Failed to load users</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <p className="text-sm">{search ? "No users found" : "No contacts yet"}</p>
          </div>
        ) : (
          <ul className="py-1">
            {users.map((user) => {
              const isOnline = onlineSet.has(user._id);
              const isActive = activeUser?._id === user._id;
              const isTyping =
                typingUser?.fromUserId === user._id && typingUser?.isTyping;

              return (
                <li key={user._id}>
                  <button
                    onClick={() => onSelectUser(user)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-100 text-left relative
                      ${isActive
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                      }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-blue-500" />
                    )}

                    <Avatar username={user.username} online={isOnline} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <h3
                          className={`text-sm truncate ${isActive
                              ? "font-semibold text-blue-600"
                              : unreadCounts[user._id] > 0
                                ? "font-bold text-gray-900"
                                : "font-semibold text-gray-800"
                            }`}
                        >
                          {user.username}
                        </h3>
                        {/* Unread badge */}
                        {!isActive && unreadCounts[user._id] > 0 && (
                          <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                            {unreadCounts[user._id] > 99 ? "99+" : unreadCounts[user._id]}
                          </span>
                        )}
                      </div>

                      {isTyping ? (
                        <p className="text-xs text-blue-500 font-medium flex items-center gap-1 mt-0.5">
                          <span className="flex gap-0.5 items-center">
                            {[0, 120, 240].map((d) => (
                              <span
                                key={d}
                                className="w-1 h-1 rounded-full bg-blue-400 block"
                                style={{
                                  animation: "typingBounce 1.2s infinite ease-in-out",
                                  animationDelay: `${d}ms`,
                                }}
                              />
                            ))}
                          </span>
                          typing…
                        </p>
                      ) : (
                        <p
                          className={`text-xs mt-0.5 truncate ${isOnline ? "text-emerald-500" : "text-gray-400"
                            }`}
                        >
                          {isOnline ? "Online" : formatLastSeen(user.lastSeen)}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-4px); }
        }
      `}</style>
    </section>
  );
};

export default ConversationList;