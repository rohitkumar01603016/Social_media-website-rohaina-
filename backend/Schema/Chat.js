const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    lockedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        passwordHash: { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatModel);

module.exports = Chat;
