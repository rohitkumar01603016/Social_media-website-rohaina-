const Message = require("../../Schema/message");
const User = require("../../Schema/User");

const markViewOnce = async (req, res) => {
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

    if (!message.viewOnce) {
      return res.json(message);
    }

    const viewerId = req.user._id.toString();
    const senderId = message.sender?._id?.toString();

    if (senderId !== viewerId) {
      const hasViewed = message.viewedBy.some(
        (item) => item.toString() === viewerId
      );

      if (!hasViewed) {
        message.viewedBy.push(req.user._id);
        await message.save();
      }
    }

    const populatedMessage = await User.populate(message, {
      path: "chat.users",
      select: "name image email isOnline lastSeen",
    });

    const responsePayload = populatedMessage.toObject();
    responsePayload.viewOnceOpened = senderId !== viewerId;

    return res.json(responsePayload);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "Could not mark view-once message",
    });
  }
};

module.exports = markViewOnce;
