const Post = require('../../Schema/Post')



const remove = async (req, res) => {
  let post = req.post
  try{
    let deletedPost = await post.remove()
    res.json(deletedPost)
  }catch(err){
    return res.status(400).json({
      error: err.message || "Could not remove post"
    })
  }
}

module.exports=remove
