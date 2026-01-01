const Message = ({senderId, currentUserId, user, message }) => {
    const isMe = senderId === currentUserId

    return (
        <div className={`p-2 rounded-xl m-1.5 w-fit max-w-[70%] ${isMe?'bg-green-400 ml-auto' : 'bg-gray-100'}`}>
            <span className="font-semibold block">{isMe?"You":user}</span>
            <p className="pl-4">{message}</p>
        </div>
    )
}

export default Message
