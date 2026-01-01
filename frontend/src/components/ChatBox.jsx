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
      <div className="h-full overflow-auto">
        {messages.map((msg ,index) => (
          <Message
            key={index}
            senderId={msg.senderId}
            currentUserId={socket.id}
            user={`User ID: ${msg.user}`}
            message={msg.message ?? msg}
        />
        ))}

        {/* 👇 Invisible div for scrolling */}
      <div ref={bottomRef} />
      </div>  
    </>
  )
}

export default ChatBox
