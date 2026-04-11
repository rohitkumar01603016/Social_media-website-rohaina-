const bcrypt = require("bcryptjs");
const Chat = require("../../Schema/Chat");

const getCurrentLock = (chat, userId) =>
  Array.isArray(chat.lockedBy)
    ? chat.lockedBy.find((item) => item.user?.toString() === userId.toString())
    : null;

const toggleArchiveChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const currentUserId = req.user._id.toString();
    const archivedBy = Array.isArray(chat.archivedBy)
      ? chat.archivedBy.map((item) => item.toString())
      : [];
    const isArchived = archivedBy.includes(currentUserId);

    if (isArchived) {
      chat.archivedBy = chat.archivedBy.filter(
        (item) => item.toString() !== currentUserId
      );
    } else {
      chat.archivedBy.push(req.user._id);
    }

    await chat.save();

    return res.json({
      success: true,
      archived: !isArchived,
      chatId: chat._id,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Could not archive chat" });
  }
};

const setChatPassword = async (req, res) => {
  const password =
    typeof req.body.password === "string" ? req.body.password.trim() : "";

  if (!password || password.length < 4) {
    return res.status(400).json({
      error: "Chat password must be at least 4 characters",
    });
  }

  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const currentUserId = req.user._id.toString();
    const passwordHash = await bcrypt.hash(password, 10);
    const currentLock = getCurrentLock(chat, currentUserId);

    if (currentLock) {
      currentLock.passwordHash = passwordHash;
      currentLock.updatedAt = new Date();
    } else {
      chat.lockedBy.push({
        user: req.user._id,
        passwordHash,
        updatedAt: new Date(),
      });
    }

    await chat.save();

    return res.json({
      success: true,
      locked: true,
      chatId: chat._id,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Could not protect chat" });
  }
};

const removeChatPassword = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const currentUserId = req.user._id.toString();
    chat.lockedBy = (chat.lockedBy || []).filter(
      (item) => item.user?.toString() !== currentUserId
    );
    await chat.save();

    return res.json({
      success: true,
      locked: false,
      chatId: chat._id,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Could not remove chat lock" });
  }
};

const unlockChat = async (req, res) => {
  const password =
    typeof req.body.password === "string" ? req.body.password.trim() : "";

  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const currentLock = getCurrentLock(chat, req.user._id);

    if (!currentLock) {
      return res.json({
        success: true,
        unlocked: true,
        chatId: chat._id,
      });
    }

    const isMatch = await bcrypt.compare(password, currentLock.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        error: "Chat password is incorrect",
      });
    }

    return res.json({
      success: true,
      unlocked: true,
      chatId: chat._id,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Could not unlock chat" });
  }
};

module.exports = {
  toggleArchiveChat,
  setChatPassword,
  removeChatPassword,
  unlockChat,
};
