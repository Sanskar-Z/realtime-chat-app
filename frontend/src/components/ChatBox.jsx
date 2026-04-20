import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { fetchPrivateMessages } from "../services/messageService";

const ChatBox = ({ messages = [], currentUserId, activeUser }) => {
  const bottomRef = useRef(null);
  const [initialMessages, setInitialMessages] = useState([]);

  // Fetch messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setInitialMessages([]);
        const data = await fetchPrivateMessages(activeUser);

        setInitialMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setInitialMessages([]);
      }
    };

    if (activeUser) {
      loadMessages();
    }
  }, [activeUser]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, initialMessages]);


  const allMessages = [...initialMessages, ...messages];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
      {console.log(initialMessages)}
      {console.log(messages)}
      {(allMessages || []).map((msg, index) => {
        if (msg.type === "system") {
          return (
            <div
              key={msg._id || index}
              className="text-center text-xs text-gray-400"
            >
              {msg.message}
            </div>
          );
        }

        return (
          <Message
            key={msg._id || index}
            senderId={msg.senderId || msg.sender} // ✅ handles both cases
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