const User = require("../../Schema/User");
const Chat = require("../../Schema/Chat");
const Message = require("../../Schema/message");
require("../../Schema/message");

const sanitizeChatForUser = (chat, userId) => {
  const chatObject =
    typeof chat.toObject === "function" ? chat.toObject() : { ...chat };
  const userIdString = userId.toString();
  const archivedBy = Array.isArray(chatObject.archivedBy) ? chatObject.archivedBy : [];
  const currentLock = Array.isArray(chatObject.lockedBy)
    ? chatObject.lockedBy.find((item) => item.user?.toString() === userIdString)
    : null;

  return {
    ...chatObject,
    archivedForCurrentUser: archivedBy.some(
      (item) => item.toString() === userIdString
    ),
    passwordProtected: Boolean(currentLock),
    lockedBy: Array.isArray(chatObject.lockedBy)
      ? chatObject.lockedBy.map((item) => ({
          user: item.user,
          updatedAt: item.updatedAt,
        }))
      : [],
  };
};

const fetchChats = async (req, res) => {
  try {
    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name email image isOnline lastSeen",
    });

    const chatIds = results.map((chat) => chat._id);
    const unreadResults = chatIds.length
      ? await Message.aggregate([
          {
            $match: {
              chat: { $in: chatIds },
              sender: { $ne: req.user._id },
              readBy: { $ne: req.user._id },
              deletedFor: { $ne: req.user._id },
              deletedForEveryone: { $ne: true },
            },
          },
          {
            $group: {
              _id: "$chat",
              unreadCount: { $sum: 1 },
            },
          },
        ])
      : [];

    const unreadMap = unreadResults.reduce((currentValue, item) => {
      currentValue[item._id.toString()] = item.unreadCount;
      return currentValue;
    }, {});

    return res
      .status(200)
      .send(
        results.map((chat) => {
          const sanitizedChat = sanitizeChatForUser(chat, req.user._id);
          const unreadCount = unreadMap[chat._id.toString()] || 0;

          return {
            ...sanitizedChat,
            unreadCount,
            hasUnread: unreadCount > 0,
          };
        })
      );
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not fetch chats",
    });
  }
};

module.exports = fetchChats;
