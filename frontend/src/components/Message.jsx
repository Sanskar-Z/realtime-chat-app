const Message = ({ senderId, currentUserId, message, createdAt }) => {
  const isMe = senderId === currentUserId

  return (
    <div
      className={`p-2 rounded-xl m-1.5 w-[10%] max-w-[70%] ${isMe ? "bg-green-400 ml-auto" : "bg-gray-100"
        }`}
    >
      {/* <span className="font-semibold block truncate">
        {isMe ? "You" : ""}
      </span> */}
      <p className="whitespace-pre-wrap">
        {message}
      </p>

      <div className="flex font-light gap-2 text-[15px] justify-end">
        {/* <span>{new Date(createdAt).toLocaleDateString()}</span> */}
        <span>{new Date(createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}</span>
      </div>
    </div>
  )
}

export default Message
