import { useEffect, useRef } from "react"
import Message from "./Message"

const ChatBox = ({ messages = [], currentUserId }) => {
  const bottomRef = useRef(null)
  
  // AUTO SCROLL EFFECT
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <>
      <div className="h-full overflow-auto flex-col px-4 py-3 gap-1.5 flex">
        {messages?.map((msg, index) => {
        if (msg.type === "system") {
          return(<div key={index} className="text-center text-xs text-gray-500 my-2">
              {msg.message}
            </div>)
          } 

          return( <Message
            key={msg._id}
            senderId={msg.senderId}
            currentUserId={currentUserId}
            message={msg.message ?? msg}
            createdAt={msg.createdAt}
          />)
        })}

      <div ref={bottomRef} />
      </div>  
    </>
  )
}

export default ChatBox
