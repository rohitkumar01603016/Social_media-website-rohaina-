const Message = require("../../Schema/message");

const deleteMessageForMe = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    const currentUserId = req.user._id.toString();
    const alreadyDeleted = message.deletedFor.some(
      (item) => item.toString() === currentUserId
    );

    if (!alreadyDeleted) {
      message.deletedFor.push(req.user._id);
      await message.save();
    }

    return res.json({
      success: true,
      messageId: message._id,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "Could not delete message for you",
    });
  }
};

module.exports = deleteMessageForMe;
