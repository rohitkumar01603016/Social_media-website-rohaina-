const Message = require("../../Schema/message");

const markChatRead = async (req, res) => {
  try {
    const result = await Message.updateMany(
      {
        chat: req.params.chatId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
        deletedFor: { $ne: req.user._id },
        deletedForEveryone: { $ne: true },
      },
      {
        $addToSet: {
          readBy: req.user._id,
        },
      }
    );

    return res.json({
      success: true,
      updatedCount:
        typeof result?.modifiedCount === "number"
          ? result.modifiedCount
          : result?.nModified || 0,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not mark chat as read",
    });
  }
};

module.exports = markChatRead;
