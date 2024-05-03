// routes/messageRoutes.js

import express from "express";

import { authMiddleware } from "../Middleware/authMiddleware.js";

import Message from "../Models/message.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Assuming the authenticated user's ID is stored in req.userId
    const messages = await Message.find({ receiver: userId })
      .populate("sender", "name email") // Populate sender field with user's name and email
      .populate("receiver", "name email") // Populate receiver field with user's name and email
      .exec();

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get messages for a specific conversation
router.get(
  "/conversation/:conversationId",
  authMiddleware,
  async (req, res) => {
    try {
      const { conversationId } = req.params;

      // Find all messages belonging to the given conversation ID
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 }) // Optionally, sort messages by createdAt timestamp
        .populate("sender", "name email") // Populate sender field with user's name and email
        .exec();

      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiver, text } = req.body;
    const sender = req.userId;

    // Check if the text field is empty or not provided
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Message text is required" });
    }

    // Check if a conversation already exists between sender and receiver
    let conversationId = [sender, receiver].sort().join("-");
    let existingConversation = await Message.findOne({ conversationId });

    // If conversation doesn't exist, check the other permutation
    if (!existingConversation) {
      conversationId = [receiver, sender].sort().join("-");
      existingConversation = await Message.findOne({ conversationId });
    }

    // If no conversation found, create a new one
    if (!existingConversation) {
      await new Message({ conversationId, sender, receiver, text }).save();
    } else {
      // Add the message to the existing conversation
      await new Message({ conversationId, sender, receiver, text }).save();
    }
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Find all unique conversation IDs where the authenticated user is either the sender or receiver
    const conversationIds = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .distinct("conversationId")
      .exec();
    if (conversationIds.length === 0) {
      return res.status(200).json([]);
    }
    // Fetch additional information for each conversation (e.g., names of sender and receiver)
    const conversations = await Promise.all(
      conversationIds.map(async (conversationId) => {
        const latestMessage = await Message.findOne({ conversationId })
          .sort({ createdAt: -1 })
          .populate("sender", "name")
          .populate("receiver", "name")
          .exec();

        const otherUser =
          latestMessage.sender._id.toString() === userId
            ? latestMessage.receiver
            : latestMessage.sender;

        return {
          userId,
          conversationId,
          otherUser: { _id: otherUser._id, name: otherUser.name },
          latestMessage: latestMessage.text,
          createdAt: latestMessage.createdAt,
        };
      })
    );

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:messageId", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    // Find the message by ID
    const message = await Message.findById(messageId);

    // Check if the message exists
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (message.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this message" });
    }
    console.log(message, text);
    // Update the message text
    message.text = text;
    await message.save();

    res.status(200).json({ message: "Message updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a message
router.delete("/:messageId", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    // Find the message by ID
    const message = await Message.findById(messageId);
    console.log(message);
    // Check if the message exists
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the user is the sender or receiver of the message
    if (
      message.sender.toString() !== userId &&
      message.receiver.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this message" });
    }

    // Delete the message
    await message.deleteOne();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const messageRouter = router;
