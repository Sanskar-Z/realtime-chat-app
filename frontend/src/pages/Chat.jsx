import Sidebar from "../components/Sidebar"
import ChatBox from "../components/ChatBox"
import ChatInput from "../components/ChatInput"
import useSocket from "../socket/useSocket"

const Chat = () => {
  useSocket() // initialize socket once

  return (
    <main className="m-2 flex justify-center items-center h-screen gap-2">
      <Sidebar />
      <div className="p-3 flex flex-col w-full h-[96vh] border border-gray-200 shadow-md rounded-2xl">
        <nav className="p-3 font-bold text-xl shadow-sm rounded-lg">
            <h1>User</h1>
        </nav>
        <ChatBox />
        <ChatInput />
      </div>
    </main>
  )
}

export default Chat
