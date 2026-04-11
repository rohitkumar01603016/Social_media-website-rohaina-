import React, { useEffect, useRef, useState } from "react";
import Post from "./Post";
import Posts from "./Posts";
import auth from "./../auth/auth-help";
import jwt1 from "jwt-decode";
import {
  createStory,
  deleteStory,
  getFeed,
  getStoryFeed,
  read,
  toggleStoryLike,
  viewStory,
} from "../api/api-post";
import FindPeople from "./FindPeople";
import { useNavigate } from "react-router-dom";
import MoonLoader from "react-spinners/MoonLoader";
import { toast } from "react-toastify";
import NavBar from "./NavBar";

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-541.jpg";

const uploadStoryImage = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "chat-app");
  data.append("cloud_name", "dwjy0lwss");

  const response = await fetch("https://api.cloudinary.com/v1_1/dwjy0lwss/image/upload", {
    method: "post",
    body: data,
  });
  const result = await response.json();
  const imageUrl = result.secure_url || result.url;

  if (!response.ok || !imageUrl) {
    throw new Error(result.error?.message || "Could not upload story image");
  }

  return imageUrl.toString();
};

const HomePage = () => {
  const [posts, SetPosts] = useState([]);
  const [isnew, setnew] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [storyUploading, setStoryUploading] = useState(false);

  const nav = useNavigate();
  const storyInputRef = useRef(null);
  const jwt = auth.isAuthenticated();
  const user1 = jwt1(jwt.token);

  const Addone = (data1) => {
    setnew(true);
    SetPosts((currentPosts) => [data1, ...currentPosts]);
    toast.success("Post uploaded", {
      position: toast.POSITION.TOP_LEFT,
      autoClose: 1200,
    });
    setTimeout(() => {
      setnew(false);
    }, 800);
  };

  useEffect(() => {
    getFeed(
      {
        userId: user1.id,
      },
      {
        t: jwt.token,
      }
    ).then((data) => SetPosts(Array.isArray(data) ? data : []));
    getStoryFeed(
      {
        userId: user1.id,
      },
      {
        t: jwt.token,
      }
    ).then((data) => setStories(Array.isArray(data) ? data : []));
  }, [jwt.token, user1.id]);

  useEffect(() => {
    read(
      {
        userId: user1.id,
      },
      {
        t: jwt.token,
      }
    ).then((data) => {
      if (data) {
        setProfile(data);
      }
    });
  }, [jwt.token, user1.id]);

  const updata = (post) => {
    SetPosts((currentPosts) =>
      currentPosts.filter((item) => item._id !== post._id)
    );
    toast.success("Post deleted", {
      position: toast.POSITION.TOP_LEFT,
      autoClose: 1200,
    });
  };

  const replaceStoryInState = (updatedStory) => {
    setStories((currentStories) =>
      currentStories.map((story) =>
        story._id === updatedStory._id ? updatedStory : story
      )
    );
  };

  const openStory = async (story) => {
    try {
      if (
        story.author?._id !== user1.id &&
        !story.viewedByCurrentUser
      ) {
        const viewedStory = await viewStory(
          { storyId: story._id },
          { t: jwt.token }
        );
        replaceStoryInState(viewedStory);
        setActiveStory(viewedStory);
        return;
      }

      setActiveStory(story);
    } catch (error) {
      toast.error(error.message || "Could not open story", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1200,
      });
    }
  };

  const handleStoryLike = async () => {
    if (!activeStory) {
      return;
    }

    try {
      const updatedStory = await toggleStoryLike(
        { storyId: activeStory._id },
        { t: jwt.token }
      );
      replaceStoryInState(updatedStory);
      setActiveStory(updatedStory);
    } catch (error) {
      toast.error(error.message || "Could not react to story", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1200,
      });
    }
  };

  const handleStoryDelete = async () => {
    if (!activeStory) {
      return;
    }

    try {
      await deleteStory(
        { storyId: activeStory._id },
        { t: jwt.token }
      );
      setStories((currentStories) =>
        currentStories.filter((story) => story._id !== activeStory._id)
      );
      setActiveStory(null);
      toast.success("Story deleted", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1200,
      });
    } catch (error) {
      toast.error(error.message || "Could not delete story", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1200,
      });
    }
  };

  const handleCreateStory = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setStoryUploading(true);
      const caption = window.prompt("Write a story caption (optional)", "") || "";
      const imageUrl = await uploadStoryImage(file);
      const createdStory = await createStory(
        { userId: user1.id },
        { t: jwt.token },
        {
          caption,
          media: [imageUrl],
        }
      );

      setStories((currentStories) => [createdStory, ...currentStories]);
      toast.success("Story uploaded", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1200,
      });
    } catch (error) {
      toast.error(error.message || "Could not create story", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1200,
      });
    } finally {
      setStoryUploading(false);
      event.target.value = "";
    }
  };

  const followersCount = Array.isArray(profile?.followers)
    ? profile.followers.length
    : 0;
  const followingCount = Array.isArray(profile?.following)
    ? profile.following.length
    : 0;
  const todaysPosts = posts.filter((post) => {
    const postDate = new Date(post.created || post.createdAt);
    const now = new Date();

    return (
      !Number.isNaN(postDate.getTime()) &&
      postDate.getDate() === now.getDate() &&
      postDate.getMonth() === now.getMonth() &&
      postDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="feed-page">
      <NavBar />

      <section className="container feed-shell">
        <div className="feed-layout">
          <div className="feed-main-column">
            <div className="glass-card feed-hero-card">
              <span className="section-chip">ROHAINA home</span>

              <div className="feed-hero-grid">
                <div>
                  <h1 className="feed-hero-title">
                    {profile?.name || user1.name}, your social home looks sharper
                    now.
                  </h1>
                  <p className="feed-hero-copy">
                    Stories, posts, suggestions, and your conversation flow now
                    sit inside a cleaner Instagram-inspired layout with stronger
                    spacing, calmer cards, and a clearer brand identity.
                  </p>
                </div>

                <div className="feed-hero-stats">
                  <div className="feed-stat">
                    <strong>{posts.length}</strong>
                    <span>Posts in your current feed</span>
                  </div>
                  <div className="feed-stat">
                    <strong>{todaysPosts}</strong>
                    <span>Fresh posts shared today</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card stories-card">
              <div className="app-section-heading">
                <div>
                  <h2>Stories</h2>
                  <p className="app-muted-text">
                    Post a moment that vanishes after 24 hours, and track who saw it.
                  </p>
                </div>
                {storyUploading ? (
                  <span className="app-muted-text">Uploading story...</span>
                ) : null}
              </div>

              <input
                ref={storyInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleCreateStory}
              />

              <div className="story-row">
                <button
                  type="button"
                  className="story-button"
                  onClick={() => storyInputRef.current?.click()}
                >
                  <span className="story-ring story-ring-add">
                    <span className="story-add-plus">+</span>
                  </span>
                  <span className="story-copy">
                    <strong>Add story</strong>
                    <span>24h live</span>
                  </span>
                </button>

                {stories.map((story) => (
                  <button
                    type="button"
                    key={story._id}
                    className={`story-button ${story.viewedByCurrentUser ? "seen" : ""}`}
                    onClick={() => openStory(story)}
                  >
                    <span className="story-ring">
                      <img
                        src={story.media?.[0] || story.author?.image || DEFAULT_AVATAR}
                        alt={story.author?.name || "Story"}
                      />
                    </span>
                    <span className="story-copy">
                      <strong>{story.author?.name || "Story"}</strong>
                      <span>
                        {story.likeCount || 0} likes · {story.viewerCount || 0} views
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Post onAdd1={Addone} currentUser={profile} />

            {isnew ? (
              <div className="d-flex justify-content-center py-3">
                <MoonLoader color="#dc5b4d" loading size={40} />
              </div>
            ) : null}

            {posts.length > 0 ? (
              posts.map((post) => (
                <Posts updatePosts={updata} key={post._id} post={post} />
              ))
            ) : (
              <div className="glass-card feed-empty-card">
                <h3>Your feed is ready for its first highlight.</h3>
                <p>
                  Share a photo or thought above, and ROHAINA will start filling
                  this space with your latest moments.
                </p>
              </div>
            )}
          </div>

          <div className="feed-side-column">
            <div className="glass-card mini-info-card">
              <div className="app-section-heading">
                <div>
                  <h3>Pulse board</h3>
                  <p className="app-muted-text">
                    Quick numbers from your current profile snapshot.
                  </p>
                </div>
              </div>

              <div className="mini-info-grid">
                <div className="mini-info-card-item">
                  <strong>{followersCount}</strong>
                  <span>Followers</span>
                </div>
                <div className="mini-info-card-item">
                  <strong>{followingCount}</strong>
                  <span>Following</span>
                </div>
                <div className="mini-info-card-item">
                  <strong>{stories.length}</strong>
                  <span>Live stories</span>
                </div>
                <div className="mini-info-card-item">
                  <strong>{posts.length > 0 ? "Live" : "Start"}</strong>
                  <span>Feed status</span>
                </div>
              </div>
            </div>

            <FindPeople />
          </div>
        </div>
      </section>

      {activeStory ? (
        <div className="story-modal" onClick={() => setActiveStory(null)}>
          <div
            className="story-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="story-modal-visual"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.02), rgba(26,16,12,0.28)), url(${activeStory.media?.[0] || activeStory.author?.image || DEFAULT_AVATAR})`,
              }}
            />
            <div className="story-modal-copy">
              <div>
                <div className="brand-inline mb-4">
                  <span className="brand-mark small">R</span>
                  <span className="brand-copy">
                    <span className="brand-name">ROHAINA</span>
                    <span className="brand-tag">story moment</span>
                  </span>
                </div>
                <h3>{activeStory.author?.name || "Story"}</h3>
                <p>{activeStory.caption || "A quick moment shared for the next 24 hours."}</p>
              </div>

              <div className="story-meta-panel">
                <div className="story-meta-row">
                  <strong>{activeStory.viewerCount || 0}</strong>
                  <span>Views</span>
                </div>
                <div className="story-meta-row">
                  <strong>{activeStory.likeCount || 0}</strong>
                  <span>Likes</span>
                </div>
              </div>

              {activeStory.author?._id === user1.id ? (
                <div className="story-activity-grid">
                  <div>
                    <strong className="story-activity-title">Viewed by</strong>
                    <div className="story-activity-list">
                      {(activeStory.viewers || []).length > 0 ? (
                        activeStory.viewers.map((item) => (
                          <div key={item.user?._id} className="story-activity-item">
                            <img
                              src={item.user?.image || DEFAULT_AVATAR}
                              alt={item.user?.name || "Viewer"}
                            />
                            <span>{item.user?.name || "Viewer"}</span>
                          </div>
                        ))
                      ) : (
                        <span className="app-muted-text">No viewers yet</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <strong className="story-activity-title">Liked by</strong>
                    <div className="story-activity-list">
                      {(activeStory.likes || []).length > 0 ? (
                        activeStory.likes.map((item) => (
                          <div key={item.user?._id} className="story-activity-item">
                            <img
                              src={item.user?.image || DEFAULT_AVATAR}
                              alt={item.user?.name || "Liker"}
                            />
                            <span>{item.user?.name || "Liker"}</span>
                          </div>
                        ))
                      ) : (
                        <span className="app-muted-text">No likes yet</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="d-flex gap-2 flex-wrap">
                {activeStory.author?._id !== user1.id ? (
                  <button
                    type="button"
                    className="landing-btn primary"
                    onClick={handleStoryLike}
                  >
                    {activeStory.likedByCurrentUser ? "Unlike story" : "Like story"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="landing-btn primary"
                    onClick={handleStoryDelete}
                  >
                    Delete story
                  </button>
                )}
                <button
                  type="button"
                  className="landing-btn secondary"
                  onClick={() => setActiveStory(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="landing-btn secondary"
                  onClick={() => {
                    setActiveStory(null);
                    nav("/user/" + activeStory.author?._id);
                  }}
                >
                  Open profile
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HomePage;
