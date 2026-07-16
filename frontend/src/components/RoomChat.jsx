import { useEffect, useRef, useState } from "react"
import socket from "../socket/socket"
import api from "../services/api"
import { BsPeopleFill, BsBoxArrowRight } from "react-icons/bs"
import { FiSend, FiSmile, FiPaperclip, FiX } from "react-icons/fi"

// ─── Room message bubble ───────────────────────────────────────────────────────
const RoomMessage = ({ msg, currentUserId }) => {
    const isMe = String(msg.senderId) === String(currentUserId)

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[62%] ${!isMe ? "flex gap-2 items-end" : ""}`}>
                {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold flex items-center justify-center flex-shrink-0 mb-1 select-none">
                        {(msg.senderName || "?")[0].toUpperCase()}
                    </div>
                )}
                <div>
                    {!isMe && (
                        <p className="text-[11px] text-gray-400 font-medium ml-1 mb-0.5">{msg.senderName}</p>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${isMe
                            ? "bg-blue-500 text-white rounded-br-sm shadow-blue-200"
                            : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                        }`}
                    >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                            <span className={`text-[10px] tabular-nums ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Room Chat ─────────────────────────────────────────────────────────────────
const RoomChat = ({ activeRoom, currentUserId, onLeave }) => {
    const [messages, setMessages] = useState([])
    const [text, setText] = useState("")
    const [leaving, setLeaving] = useState(false)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)
    const [showMembers, setShowMembers] = useState(false)

    const handleLeave = async () => {
        if (leaving) return
        setLeaving(true)
        try {
            await api.post(`/rooms/${activeRoom._id}/leave`)
            socket.emit("leave-room", activeRoom._id)
            onLeave()
        } catch (err) {
            console.error("Failed to leave room:", err)
            setLeaving(false)
        }
    }

    // Load history and join socket room
    useEffect(() => {
        if (!activeRoom?._id) return

        socket.emit("join-room", activeRoom._id)

        api.get(`/rooms/${activeRoom._id}/messages`)
            .then((res) => {
                const data = res.data.data || []
                setMessages(data.map((m) => ({
                    _id: m._id,
                    roomId: activeRoom._id,
                    senderId: String(m.sender?._id || m.sender),
                    senderName: m.sender?.username || "Unknown",
                    message: m.message,
                    createdAt: m.createdAt
                })))
            })
            .catch((err) => console.error("Failed to load room messages:", err))

        return () => {
            socket.emit("leave-room", activeRoom._id)
            setMessages([])
        }
    }, [activeRoom])

    // Incoming room messages
    useEffect(() => {
        const handle = (msg) => {
            if (msg.roomId !== activeRoom?._id) return
            setMessages((prev) => {
                if (prev.some((m) => m._id?.toString() === msg._id?.toString())) return prev
                return [...prev, msg]
            })
        }
        socket.on("room-message", handle)
        return () => socket.off("room-message", handle)
    }, [activeRoom])

    // Auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const send = (e) => {
        e?.preventDefault()
        if (!text.trim() || !socket.connected || !activeRoom) return
        socket.emit("room-message", { roomId: activeRoom._id, message: text.trim() })
        setText("")
        inputRef.current?.focus()
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            send()
        }
    }

    if (!activeRoom) return null

    return (
        <>
            {/* Header */}
            <header className="h-[65px] flex-shrink-0 bg-white border-b border-gray-100 flex items-center px-5 gap-3 select-none">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-base flex-shrink-0">
                    {activeRoom.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 text-[15px] truncate">{activeRoom.name}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {activeRoom.members?.length || 0} members
                    </p>
                </div>

                <button
                    onClick={() => setShowMembers(!showMembers)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150
                            ${showMembers
                            ? "bg-blue-500 text-white shadow-sm shadow-blue-100"
                            : "text-gray-400 hover:bg-blue-50 hover:text-blue-500"
                        }`}>
                    {showMembers ? <FiX size={16} /> : <BsPeopleFill size={16} />}
                </button>

                {/* Leave button */}
                <button
                    onClick={handleLeave}
                    disabled={leaving}
                    title="Leave room"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-all duration-150 ml-1 disabled:opacity-50"
                >
                    <BsBoxArrowRight size={16} />
                </button>
            </header >

            <div className="flex flex-1 overflow-hidden bg-white min-h-0">
                {/* Messages */}
                < div
                    className="flex-1 overflow-y-auto px-6 py-5 space-y-2"
                    style={{
                        backgroundColor: "#F7F8FA",
                        backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
                        backgroundSize: "24px 24px"
                    }
                    }
                >
                    {
                        messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none gap-3">
                                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
                                    <BsPeopleFill size={28} className="text-purple-200" />
                                </div>
                                <p className="text-sm font-medium text-gray-400">No messages yet</p>
                                <p className="text-xs text-gray-300">Say hello to the room!</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={msg._id || index} className="msg-enter">
                                    <RoomMessage msg={msg} currentUserId={currentUserId} />
                                </div>
                            ))
                        )
                    }
                    < div ref={bottomRef} />
                </div >

                {showMembers && (
                    <div className="w-72 border-l border-gray-200 bg-white flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div>
                                <h3 className="font-semibold text-gray-800">Members</h3>
                                <p className="text-xs text-gray-400">
                                    {activeRoom.members?.length || 0} members
                                </p>
                            </div>

                            <button
                                onClick={() => setShowMembers(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition"
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        {/* Members */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {activeRoom.members?.map((member) => (
                                <div
                                    key={member._id}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                                        {member.username?.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {member.username}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {activeRoom.members?.length === 0 && (
                                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                                    No members found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            < footer className="bg-white border-t border-gray-100 px-4 py-3" >
                <form
                    onSubmit={send}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm focus-within:shadow-blue-100 transition-all duration-150"
                >
                    <button type="button" tabIndex={-1} className="text-gray-400 hover:text-blue-500 transition-colors p-0.5">
                        <FiPaperclip size={18} />
                    </button>
                    <button type="button" tabIndex={-1} className="text-gray-400 hover:text-amber-400 transition-colors p-0.5">
                        <FiSmile size={18} />
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message #${activeRoom.name}`}
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none min-w-0"
                    />
                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150
                            ${text.trim()
                                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm shadow-blue-200"
                                : "bg-blue-100 text-blue-300 cursor-not-allowed"
                            }`}
                    >
                        <FiSend size={15} className={text.trim() ? "translate-x-px" : ""} />
                    </button>
                </form>
            </footer >
        </>
    )
}

export default RoomChat