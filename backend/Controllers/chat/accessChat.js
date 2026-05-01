const User = require("../../Schema/User");
const Chat = require("../../Schema/Chat");
require("../../Schema/message");
const { usersHaveBlockedRelationship } = require("../../utils/blocking");

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

const accessChat = async (req, res) => {
  const requesterId = req.user?._id || req.body.userId;
  const userId = req.body.id;

  if (!requesterId || !userId) {
    return res.status(400).json({
      error: "Both users are required",
    });
  }

  try {
    const blocked = await usersHaveBlockedRelationship(requesterId, userId);

    if (blocked) {
      return res.status(403).json({
        error: "This chat is blocked",
      });
    }

    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: requesterId } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email image isOnline lastSeen",
    });

    if (isChat.length > 0) {
      return res.send(sanitizeChatForUser(isChat[0], requesterId));
    }

    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [requesterId, userId],
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );
    return res.status(200).json(sanitizeChatForUser(fullChat, requesterId));
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not open chat",
    });
  }
};

module.exports = accessChat;
