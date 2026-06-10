import mongoose from "mongoose";

const roomMessageSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true })

export const RoomMessage = mongoose.model("RoomMessage", roomMessageSchema)