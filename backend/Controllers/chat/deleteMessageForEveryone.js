const Message = require("../../Schema/message");
const User = require("../../Schema/User");

const deleteMessageForEveryone = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)
      .populate("sender", "name image email isOnline lastSeen")
      .populate("chat");

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    if (message.sender?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Only the sender can delete this message for everyone",
      });
    }

    message.content = "";
    message.image = "";
    message.images = [];
    message.viewOnce = false;
    message.viewedBy = [];
    message.deletedForEveryone = true;
    message.deletedAt = new Date();
    await message.save();

    const populatedMessage = await User.populate(message, {
      path: "chat.users",
      select: "name image email isOnline lastSeen",
    });

    return res.json(populatedMessage);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "Could not delete message for everyone",
    });
  }
};

module.exports = deleteMessageForEveryone;
