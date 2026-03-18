import { useState } from "react";
import socket from "../socket/socket";
import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi";

const ChatInput = ({ activeUser }) => {
  const [message, setMessage] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();

    if (!message.trim()) return;
    if (!socket.connected) return;
    if (!activeUser) return;

    socket.emit("private-message", {
      toUserId: activeUser,
      message,
    });

    setMessage("");
  };

  return (
    <footer className="p-4 bg-white border-t border-gray-100">
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 shadow-inner"
      >
        <button
          type="button"
          className="text-gray-400 hover:text-blue-500 transition"
        >
          <FiPaperclip size={20} />
        </button>

        <button
          type="button"
          className="text-gray-400 hover:text-blue-500 transition"
        >
          <FiSmile size={20} />
        </button>

        <input
          type="text"
          value={message}
          disabled={!activeUser}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            activeUser
              ? "Type a message..."
              : "Select a user to start chatting"
          }
          className="flex-1 bg-transparent outline-none text-sm"
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition disabled:opacity-40"
        >
          <FiSend size={18} />
        </button>
      </form>
    </footer>
  );
};

export default ChatInput;