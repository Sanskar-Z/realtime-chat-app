import { useEffect, useState } from "react"
import { BsPeopleFill, BsPlusLg } from "react-icons/bs"
import { FiSearch, FiX } from "react-icons/fi"
import api from "../services/api"

const RoomList = ({ activeRoom, onSelectRoom, currentUserId }) => {
    const [rooms, setRooms] = useState([])
    const [tab, setTab] = useState("joined")   // "joined" | "discover"
    const [showCreate, setShowCreate] = useState(false)
    const [roomName, setRoomName] = useState("")
    const [description, setDescription] = useState("")
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [createError, setCreateError] = useState("")
    const [joinError, setJoinError] = useState("")

    useEffect(() => {
        api.get("/rooms")
            .then((res) => setRooms(res.data.data || []))
            .catch(() => setJoinError("Failed to load rooms"))
            .finally(() => setLoading(false))
    }, [])

    const isMember = (room) =>
        room.members?.some((member) => member?._id.toString() === currentUserId?.toString()) ?? false

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
            setCreateError("")
            setTab("joined") // switch to My Rooms after creating
        } catch (err) {
            setCreateError(err.response?.data?.message || "Failed to create room")
        }
    }

    const handleJoin = async (room) => {
        try {
            await api.post(`/rooms/${room._id}/join`);

            const res = await api.get("/rooms");
            const rooms = res.data.data;

            setRooms(rooms);

            const joinedRoom = rooms.find(r => r._id === room._id);

            setTab("joined");
            setJoinError("");
            onSelectRoom(joinedRoom);
        } catch (err) {
            setJoinError(err.response?.data?.message || "Failed to join room");
        }
    };

    const handleSelect = (room) => {
        setJoinError("")
        onSelectRoom(room)
    }

    const filtered = rooms
        .filter((r) => tab === "joined" ? isMember(r) : !isMember(r))
        .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <section className="w-80 md:w-96 bg-white flex flex-col border-r border-gray-100 h-screen">

            {/* Header */}
            <div className="px-5 pt-6 pb-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900">Rooms</h1>
                    <button
                        onClick={() => { setShowCreate(!showCreate); setCreateError("") }}
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

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-3">
                    {[
                        { id: "joined", label: "My Rooms" },
                        { id: "discover", label: "Discover" }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => { setTab(t.id); setSearch(""); setJoinError("") }}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-150
                                ${tab === t.id
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {t.label}
                            {/* Badge — count of rooms in this tab */}
                            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]
                                ${tab === t.id ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400"}`}>
                                {rooms.filter((r) => t.id === "joined" ? isMember(r) : !isMember(r)).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                    <FiSearch size={15} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search ${tab === "joined" ? "your rooms" : "all rooms"}...`}
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
                        {createError && <p className="text-xs text-red-500">{createError}</p>}
                        <div className="flex gap-2 mt-1">
                            <button
                                type="submit"
                                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition font-medium shadow-sm shadow-blue-200"
                            >
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowCreate(false); setCreateError("") }}
                                className="flex-1 py-2 bg-white hover:bg-gray-50 text-gray-500 text-sm rounded-xl transition border border-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Error */}
            {joinError && (
                <p className="mx-4 mb-2 text-xs text-red-500">{joinError}</p>
            )}

            {/* Room list */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
                        Loading...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2 select-none px-6 text-center">
                        <BsPeopleFill size={28} className="text-gray-200" />
                        <p className="text-sm text-gray-400">
                            {tab === "joined"
                                ? search
                                    ? "No rooms match your search"
                                    : "You haven't joined any rooms yet"
                                : search
                                    ? "No rooms match your search"
                                    : "No new rooms to discover"
                            }
                        </p>
                        {tab === "joined" && !search && (
                            <button
                                onClick={() => setTab("discover")}
                                className="text-xs text-blue-500 font-medium hover:underline mt-1"
                            >
                                Browse rooms to join →
                            </button>
                        )}
                    </div>
                ) : (
                    filtered.map((room) => {
                        const isActive = activeRoom?._id === room._id

                        return (
                            <div
                                key={room._id}
                                onClick={() => tab === "joined" && handleSelect(room)}
                                className={`flex items-center gap-3 px-5 py-3.5 transition-colors
                                    ${tab === "joined" ? "cursor-pointer" : "cursor-default"}
                                    ${isActive
                                        ? "bg-blue-50 border-r-2 border-blue-500"
                                        : tab === "joined" ? "hover:bg-gray-50" : ""
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

                                {/* Action button */}
                                {tab === "discover" && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleJoin(room) }}
                                        className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition"
                                    >
                                        Join
                                    </button>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </section>
    )
}

export default RoomList