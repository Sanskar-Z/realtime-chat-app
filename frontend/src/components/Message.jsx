const Message = ({ senderId, currentUserId, message, createdAt }) => {
  const isMe = senderId === currentUserId;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}>
      
      <div
        className={`px-4 py-2 rounded-2xl max-w-[65%] text-sm shadow-sm
        ${
          isMe
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-white border border-gray-200 rounded-bl-none"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message}</p>

        <div
          className={`text-[10px] mt-1 ${
            isMe ? "text-blue-100 text-right" : "text-gray-400"
          }`}
        >
          {new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

    </div>
  );
};

export default Message;