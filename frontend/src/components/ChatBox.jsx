import { useState, useEffect, useRef } from "react"
import Message from "./Message"
import socket from "../socket/socket"

const ChatBox = () => {
  const [messages, setMessages] = useState([])
  const bottomRef = useRef(null)
  
  useEffect(() => {
    socket.on('receive-message', (data) => {
      console.log('received message: ', data);
      setMessages((prev) => [...prev, data])
    })
  
    return () => {
      socket.off("receive-message")
    }
  }, [])
  
  // AUTO SCROLL EFFECT
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <>
      <div className="h-full overflow-auto flex-col px-4 py-3 gap-1.5 flex">
        {messages.map((msg, index) => {
        if (msg.type === "system") {
          return(<div key={index} className="text-center text-xs text-gray-500 my-2">
              {msg.message}
            </div>)
          } 

          return( <Message
            key={index}
            senderId={msg.senderId}
            currentUserId={socket.id}
            username={msg.username}
            message={msg.message ?? msg}
          />)
        })}

        {/* 👇 Invisible div for scrolling */}
      <div ref={bottomRef} />
      </div>  
    </>
  )
}

export default ChatBox
