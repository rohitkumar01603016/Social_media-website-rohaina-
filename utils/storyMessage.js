const Chat = require("../Schema/Chat");
const Message = require("../Schema/message");
const User = require("../Schema/User");

const sendStoryReactionMessage = async ({ story, likerId, reaction = "liked" }) => {
  const authorId = story?.author?._id?.toString
    ? story.author._id.toString()
    : story?.author?.toString?.() || String(story?.author || "");
  const likerIdString = likerId?.toString?.() || String(likerId || "");

  if (!authorId || !likerIdString || authorId === likerIdString) {
    return null;
  }

  let chat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: authorId } } },
      { users: { $elemMatch: { $eq: likerIdString } } },
    ],
  });

  if (!chat) {
    chat = await Chat.create({
      chatName: "story-reaction",
      isGroupChat: false,
      users: [authorId, likerIdString],
    });
  }

  const liker = await User.findById(likerIdString, "name image email isOnline lastSeen");

  if (!liker) {
    return null;
  }

  let message = await Message.create({
    sender: likerIdString,
    content: `${liker.name} ${reaction} your story`,
    chat: chat._id,
  });

  message = await message.populate("sender", "name image email isOnline lastSeen");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name image email isOnline lastSeen",
  });

  await Chat.findByIdAndUpdate(chat._id, {
    latestMessage: message._id,
  });

  return message;
};

module.exports = {
  sendStoryReactionMessage,
};
