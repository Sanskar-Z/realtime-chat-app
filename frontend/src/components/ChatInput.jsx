import { useState } from "react";
import socket from "../socket/socket";

const ChatInput = ({ activeUser }) => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message.trim()) return;
    if (!socket.connected) return
    if (!activeUser) return;


    socket.emit("private-message", {
      toUserId: activeUser,
      message
    })

    setMessage("");
  };



  return (
    <div className="mt-auto p-2 bg-white flex gap-2 border border-gray-100 shadow-sm rounded-xl shadow-t">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-lg px-4 py-2 focus:outline-none overflow-y-auto"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg active:bg-blue-600"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;
