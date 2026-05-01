
const Post = require('../../Schema/Post')
const { attachLikeUsersToPost } = require("../../utils/postLikes");

const likePost = async(req,res)=>{
console.log(req.body)
try {
    let result = await Post.findByIdAndUpdate(req.body.postId, {$addToSet: {likes: req.body.userId}}, {new: true})
    const populatedPost = await attachLikeUsersToPost(result)
res.json(populatedPost)
} catch (error) {
return res.status(400).json({
  error: error.message || "Could not like post"
})
}

}
const unlike = async (req, res) => {
  try{
    let result = await Post.findByIdAndUpdate(req.body.postId, {$pull: {likes: req.body.userId}}, {new: true})
    const populatedPost = await attachLikeUsersToPost(result)
    res.json(populatedPost)
  }catch(err){
    return res.status(400).json({
      error: err.message || "Could not unlike post"
    })
  }
}

module.exports={likePost,unlike}
