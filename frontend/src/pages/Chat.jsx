import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import ChatBox from "../components/ChatBox"
import ChatInput from "../components/ChatInput"
import useSocket from "../socket/useSocket"
import Register from "../components/Register"
import socket from "../socket/socket"

const Chat = () => {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("username") || null
  })

  useSocket() // socket lifecycle listeners

  const handleRegister = (name) => {
    localStorage.setItem("username", name)
    setUsername(name)

    // 🔥 CONNECT AFTER REGISTER
    if (!socket.connected) {
      socket.connect()
    }
  }

  useEffect(() => {
    if (username && !socket.connected) {
      socket.auth = { username }
      socket.connect()
    }
  }, [username])

  if (!username) {
    return <Register onRegister={handleRegister} />
  }

  return (
    <main className="m-2 flex justify-center items-center h-screen gap-2">
      <Sidebar />

      <div className="p-3 flex flex-col w-full h-[96vh] border border-gray-200 shadow-md rounded-2xl">
        <nav className="p-3 font-bold text-xl shadow-sm rounded-lg">
          <h1>{username}</h1>
        </nav>

        <ChatBox />
        <ChatInput />
      </div>
    </main>
  )
}

export default Chat
