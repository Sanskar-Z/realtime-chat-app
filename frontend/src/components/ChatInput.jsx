import { useState } from "react";
import socket from "../socket/socket";

const ChatInput = () => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message.trim()) return;
    
    socket.emit("send-message", {
      senderId: socket.id,   // later from auth  // send user ID or socket ID
      message: message,
    });
    
    setMessage("");
  };

  return (
    <div className="mt-auto p-2 bg-white flex gap-2 border border-gray-100 shadow-sm rounded-xl shadow-t">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-lg px-4 py-2 focus:outline-none"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;
