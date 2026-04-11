const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    content: { type: String, trim: true },
    image: { type: String, trim: true },
    images: [{ type: String, trim: true }],
    viewOnce: { type: Boolean, default: false },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    deletedForEveryone: { type: Boolean, default: false },
    deletedAt: { type: Date },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
