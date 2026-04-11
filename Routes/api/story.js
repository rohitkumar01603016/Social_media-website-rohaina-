const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const userById = require("../../Controllers/users/userById");
const {
  createStory,
  listFeedStories,
  listUserStories,
  markStoryViewed,
  toggleStoryLike,
  deleteStory,
} = require("../../Controllers/story/storyControllers");

router.post("/:userId", auth, createStory);
router.get("/feed/:userId", auth, listFeedStories);
router.get("/user/:userId", auth, listUserStories);
router.put("/:storyId/view", auth, markStoryViewed);
router.put("/:storyId/like", auth, toggleStoryLike);
router.delete("/:storyId", auth, deleteStory);

router.param("userId", userById);

module.exports = router;
