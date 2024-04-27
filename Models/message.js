import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Index on conversationId for faster queries
messageSchema.index({ conversationId: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
