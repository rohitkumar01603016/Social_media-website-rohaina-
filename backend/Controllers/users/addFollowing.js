const User = require('../../Schema/User')

const addFollowing = async(req,res,next)=>{
    try {   
    await User.findByIdAndUpdate(req.body.userId ,{$addToSet:{following : req.body.followId}})
    return res.json(req.followedUser);
    } catch (error) {
        return res.status(400).json({
      error: error.message || "Could not update following list"
         })
    }


}

module.exports = addFollowing
