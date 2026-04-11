const User = require("../Schema/User");

const normalizeId = (value) => value?.toString?.() || String(value || "");

const hasUserBlocked = (user, targetId) => {
  const targetIdString = normalizeId(targetId);

  return Array.isArray(user?.blockedUsers)
    ? user.blockedUsers.some((item) => normalizeId(item) === targetIdString)
    : false;
};

const usersHaveBlockedRelationship = async (firstUserId, secondUserId) => {
  const firstId = normalizeId(firstUserId);
  const secondId = normalizeId(secondUserId);
  const users = await User.find(
    {
      _id: { $in: [firstUserId, secondUserId] },
    },
    "blockedUsers"
  ).lean();

  const usersById = new Map(
    users.map((user) => [normalizeId(user._id), user])
  );
  const firstUser = usersById.get(firstId);
  const secondUser = usersById.get(secondId);

  if (!firstUser || !secondUser) {
    return false;
  }

  return (
    hasUserBlocked(firstUser, secondId) ||
    hasUserBlocked(secondUser, firstId)
  );
};

module.exports = {
  hasUserBlocked,
  usersHaveBlockedRelationship,
};
