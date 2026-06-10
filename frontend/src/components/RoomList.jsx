import { useEffect, useState } from "react"
import { BsPeopleFill, BsPlusLg } from "react-icons/bs"
import { FiSearch, FiX } from "react-icons/fi"
import api from "../services/api"

const RoomList = ({ activeRoom, onSelectRoom }) => {
    const [rooms, setRooms] = useState([])
    const [showCreate, setShowCreate] = useState(false)
    const [roomName, setRoomName] = useState("")
    const [description, setDescription] = useState("")
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        api.get("/rooms")
            .then((res) => setRooms(res.data.data || []))
            .catch(() => setError("Failed to load rooms"))
            .finally(() => setLoading(false))
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!roomName.trim()) return
        try {
            const res = await api.post("/rooms/create", {
                name: roomName.trim(),
                description: description.trim()
            })
            setRooms((prev) => [res.data.data, ...prev])
            setRoomName("")
            setDescription("")
            setShowCreate(false)
            setError("")
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create room")
        }
    }

    const handleSelect = async (room) => {
        try {
            await api.post(`/rooms/${room._id}/join`)
        } catch {
            // already a member — that's fine
        }
        onSelectRoom(room)
    }

    const filtered = rooms.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <section className="w-80 md:w-96 bg-white flex flex-col border-r border-gray-100 h-screen">

            {/* Header */}
            <div className="px-5 pt-6 pb-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900">Rooms</h1>
                    <button
                        onClick={() => { setShowCreate(!showCreate); setError("") }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150
              ${showCreate
                                ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
                                : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500"
                            }`}
                        title="Create room"
                    >
                        {showCreate ? <FiX size={15} /> : <BsPlusLg size={14} />}
                    </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                    <FiSearch size={15} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search rooms..."
                        className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
                    />
                </div>
            </div>

            {/* Create room form */}
            {showCreate && (
                <div className="mx-4 mb-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex-shrink-0">
                    <p className="text-xs font-semibold text-blue-600 mb-3">New room</p>
                    <form onSubmit={handleCreate} className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Room name"
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition"
                            maxLength={30}
                            autoFocus
                        />
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 transition"
                            maxLength={60}
                        />
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <div className="flex gap-2 mt-1">
                            <button
                                type="submit"
                                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition font-medium shadow-sm shadow-blue-200"
                            >
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowCreate(false); setError("") }}
                                className="flex-1 py-2 bg-white hover:bg-gray-50 text-gray-500 text-sm rounded-xl transition border border-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Room list */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
                        Loading...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2 select-none">
                        <BsPeopleFill size={28} className="text-gray-200" />
                        <p className="text-sm text-gray-400">
                            {search ? "No rooms match your search" : "No rooms yet — create one!"}
                        </p>
                    </div>
                ) : (
                    filtered.map((room) => {
                        const isActive = activeRoom?._id === room._id
                        return (
                            <div
                                key={room._id}
                                onClick={() => handleSelect(room)}
                                className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors
                  ${isActive
                                        ? "bg-blue-50 border-r-2 border-blue-500"
                                        : "hover:bg-gray-50"
                                    }`}
                            >
                                {/* Avatar */}
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base select-none flex-shrink-0
                  ${isActive ? "bg-blue-500 text-white" : "bg-purple-100 text-purple-600"}`}>
                                    {room.name[0].toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold truncate text-[14px] ${isActive ? "text-blue-700" : "text-gray-800"}`}>
                                        {room.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                        {room.description || `${room.members?.length || 0} members`}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </section>
    )
}

export default RoomList