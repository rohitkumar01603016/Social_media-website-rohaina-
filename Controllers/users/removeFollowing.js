const User = require('../../Schema/User')

const removeFollowing = async(req,res,next)=>{
    try {   
    await User.findByIdAndUpdate(req.body.userId ,{$pull:{following : req.body.unfollowId}})
    return res.json(req.unfollowedUser);
    } catch (error) {
        return res.status(400).json({
      error: error.message || "Could not update following list"
         })
    }
}

module.exports = removeFollowing
