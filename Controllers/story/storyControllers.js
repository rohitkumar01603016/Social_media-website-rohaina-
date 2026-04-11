const Story = require("../../Schema/Story");
const { sendStoryReactionMessage } = require("../../utils/storyMessage");

const storyPopulate = (query) =>
  query
    .populate("author", "_id name image about followers following isOnline lastSeen")
    .populate("viewers.user", "_id name image")
    .populate("likes.user", "_id name image");

const serializeStory = (story, currentUserId) => {
  const storyObject =
    typeof story.toObject === "function" ? story.toObject() : { ...story };
  const currentUserIdString = currentUserId?.toString?.() || "";

  return {
    ...storyObject,
    viewerCount: Array.isArray(storyObject.viewers) ? storyObject.viewers.length : 0,
    likeCount: Array.isArray(storyObject.likes) ? storyObject.likes.length : 0,
    likedByCurrentUser: Array.isArray(storyObject.likes)
      ? storyObject.likes.some(
          (item) => item?.user?._id?.toString?.() === currentUserIdString
        )
      : false,
    viewedByCurrentUser:
      storyObject.author?._id?.toString?.() === currentUserIdString ||
      (Array.isArray(storyObject.viewers)
        ? storyObject.viewers.some(
            (item) => item?.user?._id?.toString?.() === currentUserIdString
          )
        : false),
  };
};

const createStory = async (req, res) => {
  const media = Array.isArray(req.body.media)
    ? req.body.media
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : typeof req.body.image === "string" && req.body.image.trim()
      ? [req.body.image.trim()]
      : [];
  const caption =
    typeof req.body.caption === "string" ? req.body.caption.trim() : "";

  if (media.length === 0) {
    return res.status(400).json({
      error: "Story image is required",
    });
  }

  try {
    let story = await Story.create({
      caption,
      media,
      author: req.user._id,
    });

    story = await storyPopulate(Story.findById(story._id));
    return res.status(201).json(serializeStory(story, req.user._id));
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not create story",
    });
  }
};

const listFeedStories = async (req, res) => {
  const followingIds = Array.isArray(req.profile?.following)
    ? req.profile.following.map((item) => item._id || item)
    : [];
  const authorIds = [...new Set([...followingIds, req.profile._id].map((id) => id.toString()))];

  try {
    const stories = await storyPopulate(
      Story.find({
        author: { $in: authorIds },
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 })
    );

    return res.json(stories.map((story) => serializeStory(story, req.user._id)));
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not load stories",
    });
  }
};

const listUserStories = async (req, res) => {
  try {
    const stories = await storyPopulate(
      Story.find({
        author: req.params.userId,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 })
    );

    return res.json(stories.map((story) => serializeStory(story, req.user._id)));
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not load user stories",
    });
  }
};

const markStoryViewed = async (req, res) => {
  try {
    const story = await storyPopulate(
      Story.findOne({
        _id: req.params.storyId,
        expiresAt: { $gt: new Date() },
      })
    );

    if (!story) {
      return res.status(404).json({
        error: "Story not found",
      });
    }

    const isOwner = story.author?._id?.toString() === req.user._id.toString();

    if (!isOwner) {
      const alreadyViewed = story.viewers.some(
        (item) => item.user?._id?.toString() === req.user._id.toString()
      );

      if (!alreadyViewed) {
        story.viewers.push({
          user: req.user._id,
          viewedAt: new Date(),
        });
        await story.save();
      }
    }

    const updatedStory = await storyPopulate(Story.findById(story._id));
    return res.json(serializeStory(updatedStory, req.user._id));
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not update story viewers",
    });
  }
};

const toggleStoryLike = async (req, res) => {
  try {
    const story = await storyPopulate(
      Story.findOne({
        _id: req.params.storyId,
        expiresAt: { $gt: new Date() },
      })
    );

    if (!story) {
      return res.status(404).json({
        error: "Story not found",
      });
    }

    const currentUserId = req.user._id.toString();
    const likeIndex = story.likes.findIndex(
      (item) => item.user?._id?.toString() === currentUserId
    );
    let liked = false;

    if (likeIndex >= 0) {
      story.likes.splice(likeIndex, 1);
    } else {
      story.likes.push({
        user: req.user._id,
        likedAt: new Date(),
      });
      liked = true;
    }

    await story.save();

    if (liked) {
      await sendStoryReactionMessage({
        story,
        likerId: req.user._id,
        reaction: "liked",
      });
    }

    const updatedStory = await storyPopulate(Story.findById(story._id));
    return res.json({
      ...serializeStory(updatedStory, req.user._id),
      liked,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not update story like",
    });
  }
};

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);

    if (!story) {
      return res.status(404).json({
        error: "Story not found",
      });
    }

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You can only delete your own stories",
      });
    }

    await story.deleteOne();

    return res.json({
      success: true,
      storyId: req.params.storyId,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not delete story",
    });
  }
};

module.exports = {
  createStory,
  listFeedStories,
  listUserStories,
  markStoryViewed,
  toggleStoryLike,
  deleteStory,
};
