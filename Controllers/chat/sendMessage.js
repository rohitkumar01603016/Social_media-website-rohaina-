const mongoose = require("mongoose");
const Message = require("../../Schema/message");
const Chat = require('../../Schema/Chat')
const User = require('../../Schema/User')
const { usersHaveBlockedRelationship } = require("../../utils/blocking");

const sendMessage = async (req, res) => {
  const content =
    typeof req.body.content === "string" ? req.body.content.trim() : "";
  const image =
    typeof req.body.image === "string" ? req.body.image.trim() : "";
  const images = Array.isArray(req.body.images)
    ? req.body.images
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const viewOnce = Boolean(req.body.viewOnce);
  const chatId = req.body.chatId || req.body.chat?._id || req.body.chat?.id;
  const senderId = req.user?._id || req.body.id || req.body.sender || req.body.senderId;

  if (!senderId) {
    return res.status(400).json({
      success: false,
      error: "Sender id is required",
    });
  }

  if (!chatId) {
    return res.status(400).json({
      success: false,
      error: "Chat id is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(senderId)) {
    return res.status(400).json({
      success: false,
      error: "Sender id is invalid",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({
      success: false,
      error: "Chat id is invalid",
    });
  }

  if (!content && !image && images.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Message content or image is required",
    });
  }

  const mediaItems = images.length > 0 ? images : image ? [image] : [];

  var newMessage = {
    sender: senderId,
    content: content,
    image: mediaItems[0] || "",
    images: mediaItems,
    viewOnce: viewOnce && mediaItems.length > 0,
    chat: chatId,
    readBy: [senderId],
  };

  try {
    const currentChat = await Chat.findById(chatId).populate("users", "_id");

    if (!currentChat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    if (!currentChat.isGroupChat && Array.isArray(currentChat.users)) {
      const otherUser = currentChat.users.find(
        (item) => item._id.toString() !== senderId.toString()
      );

      if (otherUser) {
        const blocked = await usersHaveBlockedRelationship(senderId, otherUser._id);

        if (blocked) {
          return res.status(403).json({
            success: false,
            error: "You cannot send messages in a blocked chat",
          });
        }
      }
    }

    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name image email isOnline lastSeen");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name image email isOnline lastSeen",
    });

    const updatedChat = await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
    });

    if (!updatedChat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    return res.json(message);
  } catch (error) {
    console.log("sendMessage error:", error.message);
    return res.status(400).json({
      success: false,
      error: error.message || "Could not send message",
    });
  }
};

module.exports = sendMessage ;


