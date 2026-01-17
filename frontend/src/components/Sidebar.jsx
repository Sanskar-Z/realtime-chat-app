import React, { useState, useEffect } from 'react'
import socket from '../socket/socket'
import chatIcon from '../images/ChatAPP.ico'

const Sidebar = () => {
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  useEffect(() => {
    socket.on("receive-message", (user) => {
      setOnlineUsers((prev) => {
        const updatedUsers = new Set(prev)
        updatedUsers.add(user.username)
        return updatedUsers
      })
    }
    )
    return () => {
      socket.off("receive-message", (user) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev)
          updated.delete(user.username)
          return updated
        })
      })
    }
  }, [])

  return (
    <div className="p-3 w-[30vw] h-[96vh] rounded-2xl bg-white border border-gray-200 shadow-md relative overflow-hidden">

      <div className="p-3 flex items-center gap-2 font-bold text-xl text-blue-600 sticky top-0 bg-white z-10">
        <img src={chatIcon} alt="Chat App" className="w-10 h-10" />
        <span>ChatAPP</span>
      </div>

      <div className="mt-2 p-3 flex flex-col gap-1.5 shadow-md bg-gray-50 rounded-lg h-[89%]">
        <h2 className="text-xl font-semibold mb-2">Online Users</h2>

        <div className="flex-1 overflow-auto">
          {onlineUsers.size === 0 ? (
            <p className="text-gray-500">No users online</p>
          ) : (
            <ul>
              {Array.from(onlineUsers).map((user, index) => (
                <li
                  key={index}
                  className="mb-2 p-2 bg-gray-100 rounded-lg shadow-sm"
                >
                  {user}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
