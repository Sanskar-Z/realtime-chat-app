import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    },

    read: {
        type: Boolean,
        default: false     // false = single tick, true = double tick
    },

    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '20d' }  // MongoDB auto-deletes after 20 days
    }

}, { timestamps: true })

export const Message = mongoose.model("Message", messageSchema);