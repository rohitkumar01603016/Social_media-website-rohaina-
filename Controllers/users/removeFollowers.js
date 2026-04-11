
const User = require('../../Schema/User')

const removeFollower =async(req,res,next)=>{
    try {
    const unfollowedUser = await User.findByIdAndUpdate(
      req.body.unfollowId,
      { $pull: { followers: req.body.userId } },
      { new: true }
    )
    .populate('following','_id name')
    .populate('followers' , '_id name')
    .exec();

    req.unfollowedUser = unfollowedUser;
    next();
    } catch (error) {
      return res.status(400).json({
        error: error.message || "Could not unfollow user"
      })        
    }
}

module.exports = removeFollower
