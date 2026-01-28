import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPrivateMessages = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
        $or:[
            {sender: userId, receiver: otherUserId},
            {sender: otherUserId, receiver: userId},
        ]
    }).sort({createdAt: 1});

    res
    .status(200)
    .json(messages);
})