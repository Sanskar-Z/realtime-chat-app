import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const getPrivateMessages = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const otherUserId = new mongoose.Types.ObjectId(req.params.userId);

    const messages = await Message.find({
        $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId },
        ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
        {
            sender: otherUserId, receiver: userId, read: false
        },
        {
            $set: { read: true }
        }
    )

    res.status(200).json(
        messages.map((msg) => ({
            _id: msg._id,
            senderId: msg.sender,
            receiverId: msg.receiver,
            message: msg.message,
            createdAt: msg.createdAt,
            read: msg.read,
        }))
    );
});