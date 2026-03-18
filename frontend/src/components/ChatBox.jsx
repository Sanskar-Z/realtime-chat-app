import { useEffect, useRef } from "react";
import Message from "./Message";

const ChatBox = ({ messages = [], currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">

      {messages.map((msg, index) => {

        if (msg.type === "system") {
          return (
            <div key={index} className="text-center text-xs text-gray-400">
              {msg.message}
            </div>
          );
        }

        return (
          <Message
            key={msg._id || index}
            senderId={msg.senderId}
            currentUserId={currentUserId}
            message={msg.message ?? msg}
            createdAt={msg.createdAt}
          />
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatBox;