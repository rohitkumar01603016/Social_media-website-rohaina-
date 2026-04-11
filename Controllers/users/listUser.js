const Post = require("../../Schema/Post");
const { attachLikeUsersToPosts } = require("../../utils/postLikes");

const list1 = async (req, res) => {
  
  try {
    let posts = await Post.find({ author: req.params.userId })
      .populate("author", "_id name image")
      .populate("comments.commentedBy", "_id name image")
      .sort("-created")
      .exec();
    const postsWithLikes = await attachLikeUsersToPosts(posts);
    res.json(postsWithLikes);
  } catch (error) {
    return res.status(400).json({
      error: error,
    });
  }
};

module.exports = list1;
