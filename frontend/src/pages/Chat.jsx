import React from 'react'
import Sidebar from '../components/Sidebar'
import ChatBox from '../components/Chatbox'
import ChatInput from '../components/ChatInput'
import useSocket from '../socket/useSocket'

const Chat = () => {
    const socket = useSocket();
    
    return (
        <>
            <main className='mt-0 m-2 flex justify-center items-center h-screen gap-2'>
                <Sidebar />
                <div className="flex flex-col w-full h-[96vh] border-2 rounded-xl">
                    <nav className='h-20'>

                    </nav>
                    <hr />
                    <ChatBox />
                    <ChatInput />
                </div>
            </main>
        </>
    )
}

export default Chat
