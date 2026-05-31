import { useEffect, useState } from "react";
import { BsFillPersonFill } from "react-icons/bs";
import api from "../services/api";
import socket from "../socket/socket";

// Formats lastSeen into a human-readable string like "5 min ago"
const formatLastSeen = (date) => {
  if (!date) return "Offline";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const ConversationList = ({
  onlineUsers = [],
  activeUser,
  onSelectUser,
  currentUserId,
  usersLoading,
}) => {
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  // Fetch all registered users once on mount
  useEffect(() => {
    api.get("/users")
      .then((res) => setAllUsers(res.data.data || []))
      .catch(() => setFetchError(true));
  }, []);

  // Typing indicator
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

  // Build a Set of online userIds for O(1) lookup
  const onlineSet = new Set(onlineUsers.map((u) => u.userId));

  // Merge DB users with online status, filter out self, apply search
  const users = allUsers
    .filter((u) => u._id !== currentUserId)
    .filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Online users first, then alphabetical
      const aOnline = onlineSet.has(a._id);
      const bOnline = onlineSet.has(b._id);
      if (aOnline !== bOnline) return aOnline ? -1 : 1;
      return a.username.localeCompare(b.username);
    });

  return (
    <section className="w-80 md:w-96 bg-white flex flex-col border-r border-gray-100">

      {/* Header */}
      <div className="p-6 pb-3">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Messages</h1>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full px-4 py-2 text-sm bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {usersLoading && allUsers.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
            Loading...
          </div>
        ) : fetchError ? (
          <div className="flex justify-center items-center h-32 text-red-400 text-sm">
            Failed to load users
          </div>
        ) : users.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
            {search ? "No users match your search" : "No other users found"}
          </div>
        ) : (
          users.map((user) => {
            const isOnline = onlineSet.has(user._id);
            return (
              <div
                key={user._id}
                onClick={() => onSelectUser(user._id)}
                className={`flex items-center px-6 py-4 cursor-pointer transition-colors
                  ${activeUser === user._id
                    ? "bg-blue-50 border-r-4 border-blue-500"
                    : "hover:bg-gray-50"
                  }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <span className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <BsFillPersonFill size={20} />
                  </span>
                  {/* Online dot */}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                      ${isOnline ? "bg-green-500" : "bg-gray-300"}`}
                  />
                </div>

                {/* Name + status + typing*/}
                <div className="ml-4 flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{user.username}</h3>

                  {typingUser?.fromUserId === user._id && typingUser?.isTyping ? (
                    <p className="text-xs text-blue-400 flex items-center gap-1">
                      <span>typing</span>
                      <span className="flex gap-0.5 items-end">
                        <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </p>
                  ) : (
                    <p className={`text-xs truncate ${isOnline ? "text-green-500" : "text-gray-400"}`}>
                      {isOnline ? "Online" : formatLastSeen(user.lastSeen)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default ConversationList;