const User = require("../../Schema/User");

const addFollower = async (req, res, next) => {
  try {
    const followedUser = await User.findByIdAndUpdate(
      req.body.followId,
      {
        $addToSet: { followers: req.body.userId },
      },
      { new: true }
    )
      .populate("following", "_id name")
      .populate("followers", "_id name")
      .exec();

    req.followedUser = followedUser;
    next();
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not follow user",
    });
  }
};

module.exports = addFollower;
