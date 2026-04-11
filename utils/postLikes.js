const mongoose = require("mongoose");
const User = require("../Schema/User");

const normalizeUserId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (value._id) {
    return value._id.toString();
  }

  return String(value);
};

const attachLikeUsersToPost = async (postDoc) => {
  if (!postDoc) {
    return postDoc;
  }

  const postObject =
    typeof postDoc.toObject === "function" ? postDoc.toObject() : { ...postDoc };
  const likeIds = Array.isArray(postObject.likes)
    ? postObject.likes.map(normalizeUserId).filter(Boolean)
    : [];

  if (likeIds.length === 0) {
    return {
      ...postObject,
      likedBy: [],
    };
  }

  const users = await User.find(
    {
      _id: { $in: likeIds },
    },
    "_id name image about"
  ).lean();

  const usersById = new Map(
    users.map((user) => [user._id.toString(), user])
  );

  return {
    ...postObject,
    likedBy: likeIds.map((id) => usersById.get(id)).filter(Boolean),
  };
};

const attachLikeUsersToPosts = async (posts) =>
  Promise.all((posts || []).map((post) => attachLikeUsersToPost(post)));

module.exports = {
  attachLikeUsersToPost,
  attachLikeUsersToPosts,
};
