import { Room } from "../models/room.model.js";
import { RoomMessage } from "../models/roomMessage.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createRoom = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name?.trim()) throw new ApiError(400, "Room name is required")

    const exists = await Room.findOne({ name: name.trim() })
    if (exists) throw new ApiError(409, "A room with this name already exists")

    const room = await Room.create({
        name: name.trim(),
        description: description?.trim() || "",
        createdBy: req.user._id,
        members: [req.user._id]
    })

    return res.status(201).json(
        new ApiResponse(201, room, "Room created successfully")
    )
})

const getRooms = asyncHandler(async (req, res) => {
    const rooms = await Room.find()
        .populate("createdBy", "username")
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(
            new ApiResponse(200, rooms, "Rooms fetched successfully")
        )
})

const joinRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.roomId)
    if (!room) throw new ApiError(404, "Room not found")

    const isMember = room.members.includes(req.user?._id)
    if (!isMember) {
        room.members.push(req.user._id)
        await room.save()
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, room, "Joined room successfully")
        )
})

const getRoomMessages = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.roomId)
    if (!room) throw new ApiError(404, "Room not found")

    const messages = await RoomMessage.find({ room: req.params.roomId })
        .populate("sender", "username")
        .sort({ createdAt: 1 });

    return res
        .status(200)
        .json(
            new ApiResponse(200, messages, "Room messages fetched successfully")
        )
})

const leaveRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.roomId)
    if (!room) throw new ApiError(404, "Room not found")

    room.members = room.members.filter(
        (id) => id.toString() !== req.user._id.toString()
    )
    await room.save()

    return res.status(200).json(
        new ApiResponse(200, {}, "Left room successfully")
    )
})

export {
    createRoom,
    getRooms,
    joinRoom,
    getRoomMessages,
    leaveRoom
}