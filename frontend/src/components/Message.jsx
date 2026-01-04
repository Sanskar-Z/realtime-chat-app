const Message = ({ senderId, currentUserId, username, message }) => {
  const isMe = senderId === currentUserId

  return (
    <div
      aria-label={isMe ? "Your message" : `${username}'s message`}
      className={`p-2 rounded-xl m-1.5 w-fit max-w-[70%] ${
        isMe ? "bg-green-400 ml-auto" : "bg-gray-100"
      }`}
    >
      <span className="font-semibold block truncate">
        {isMe ? "You" : username}
      </span>
      <p className="pl-4 whitespace-pre-wrap">
        {message}
      </p>
    </div>
  )
}

export default Message
