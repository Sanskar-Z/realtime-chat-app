import socket from "../socket/socket";
import { BsFillPersonFill } from "react-icons/bs";

const ConversationList = ({ onlineUsers = [], activeUser, onSelectUser }) => {
  const currentUserId = socket?.auth?.userId;

  const filteredUsers = onlineUsers.filter(
    (u) => u.userId !== currentUserId
  );

  return (
    <section className="w-80 md:w-96 bg-white flex flex-col border-r border-gray-100">

      {/* Header */}
      <div className="p-6 border-r border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
      </div>

      {/* Users */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No users online
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.userId}
              onClick={() => onSelectUser(user.userId)}
              className={`flex items-center px-6 py-4 cursor-pointer transition-all
              ${
                activeUser === user.userId
                  ? "bg-blue-50 border-r-4 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              {/* Avatar */}
              <span className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shadow">
                <BsFillPersonFill size={20} />
              </span>

              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-gray-800">
                  {user.username}
                </h3>
                <p className="text-xs text-green-500">Online</p>
              </div>

              {/* Online indicator */}
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ConversationList;