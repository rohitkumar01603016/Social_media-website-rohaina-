const User = require("../../Schema/User");
const Chat = require("../../Schema/Chat");
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

    return res
      .status(200)
      .send(results.map((chat) => sanitizeChatForUser(chat, req.user._id)));
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not fetch chats",
    });
  }
};

module.exports = fetchChats;
