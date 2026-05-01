const Message = require("../../Schema/message");

const allMessage = async (req, res) => {
  try {
    await Message.updateMany(
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

    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name image email isOnline lastSeen")
      .populate("chat");

    const userId = req.user?._id?.toString();
    const visibleMessages = messages.filter((message) => {
      if (!userId || !Array.isArray(message.deletedFor)) {
        return true;
      }

      return !message.deletedFor.some((item) => item.toString() === userId);
    });

    const sanitizedMessages = visibleMessages.map((message) => {
      const messageObject = message.toObject();
      const senderId = messageObject.sender?._id?.toString();
      const alreadyViewed =
        userId &&
        senderId !== userId &&
        messageObject.viewOnce &&
        Array.isArray(messageObject.viewedBy) &&
        messageObject.viewedBy.some((viewerId) => viewerId.toString() === userId);

      if (alreadyViewed) {
        return {
          ...messageObject,
          image: "",
          images: [],
          viewOnceOpened: true,
        };
      }

      return {
        ...messageObject,
        viewOnceOpened: false,
      };
    });

    res.json(sanitizedMessages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }


};

module.exports = allMessage ;


