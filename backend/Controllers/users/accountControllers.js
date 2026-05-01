const bcrypt = require("bcryptjs");
const User = require("../../Schema/User");
const Post = require("../../Schema/Post");
const Story = require("../../Schema/Story");
const Chat = require("../../Schema/Chat");
const Message = require("../../Schema/message");
const { moderateMessageWithGemini } = require("../../utils/geminiModeration");
const { askGeminiSupportAssistant } = require("../../utils/geminiSupport");

const changePassword = async (req, res) => {
  const currentPassword =
    typeof req.body.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword =
    typeof req.body.newPassword === "string" ? req.body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: "Current password and new password are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: "New password must be at least 6 characters",
    });
  }

  try {
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.updated = new Date();
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not change password",
    });
  }
};

const deleteAccount = async (req, res) => {
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!password) {
    return res.status(400).json({
      error: "Password is required to delete your account",
    });
  }

  try {
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Password is incorrect",
      });
    }

    await Promise.all([
      Post.deleteMany({ author: req.user._id }),
      Story.deleteMany({ author: req.user._id }),
      Message.deleteMany({ sender: req.user._id }),
      Chat.deleteMany({
        isGroupChat: false,
        users: req.user._id,
      }),
      Chat.updateMany(
        { users: req.user._id },
        {
          $pull: {
            users: req.user._id,
            archivedBy: req.user._id,
            lockedBy: { user: req.user._id },
          },
        }
      ),
      User.updateMany(
        {},
        {
          $pull: {
            followers: req.user._id,
            following: req.user._id,
            blockedUsers: req.user._id,
          },
        }
      ),
    ]);

    await user.deleteOne();

    return res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not delete account",
    });
  }
};

const blockUser = async (req, res) => {
  const targetUserId = req.body.targetUserId;

  if (!targetUserId) {
    return res.status(400).json({ error: "Target user is required" });
  }

  if (targetUserId.toString() === req.user._id.toString()) {
    return res.status(400).json({ error: "You cannot block yourself" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { blockedUsers: targetUserId },
      },
      { new: true }
    ).populate("blockedUsers", "_id name image");

    return res.json({
      success: true,
      blockedUsers: user.blockedUsers,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Could not block user" });
  }
};

const unblockUser = async (req, res) => {
  const targetUserId = req.body.targetUserId;

  if (!targetUserId) {
    return res.status(400).json({ error: "Target user is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { blockedUsers: targetUserId },
      },
      { new: true }
    ).populate("blockedUsers", "_id name image");

    return res.json({
      success: true,
      blockedUsers: user.blockedUsers,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Could not unblock user" });
  }
};

const moderateAndBlockUser = async (req, res) => {
  const targetUserId = req.body.targetUserId;
  const message = typeof req.body.message === "string" ? req.body.message.trim() : "";

  if (!targetUserId || !message) {
    return res.status(400).json({
      error: "Target user and message are required",
    });
  }

  try {
    const moderation = await moderateMessageWithGemini(message);

    if (moderation.shouldBlock) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { blockedUsers: targetUserId },
      });
    }

    return res.json({
      success: true,
      blocked: moderation.shouldBlock,
      moderation,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not moderate message",
    });
  }
};

const getSupportAssistantReply = async (req, res) => {
  const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
  const attachments = Array.isArray(req.body.attachments)
    ? req.body.attachments
        .slice(0, 3)
        .filter(
          (attachment) =>
            attachment &&
            typeof attachment === "object" &&
            typeof attachment.mimeType === "string" &&
            typeof attachment.data === "string"
        )
    : [];

  if (!message) {
    return res.status(400).json({
      error: "Support message is required",
    });
  }

  try {
    const reply = await askGeminiSupportAssistant({
      message,
      userName: req.user?.name,
      attachments,
    });

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not get support reply",
    });
  }
};

module.exports = {
  changePassword,
  deleteAccount,
  blockUser,
  unblockUser,
  moderateAndBlockUser,
  getSupportAssistantReply,
};
