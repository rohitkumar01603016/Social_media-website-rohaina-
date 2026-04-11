import React, { useState } from "react";
import auth from "./../auth/auth-help";
import jwt1 from "jwt-decode";
import { Like, unlike, comment, remove } from "../api/api-post.js";
import Comment from "./Comment";
import { useNavigate } from "react-router-dom";

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-541.jpg";

const Posts = (props) => {
  const nav = useNavigate();
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [text, setText] = useState("");

  const jwt = auth.isAuthenticated();
  const user1 = jwt1(jwt.token);
  const likes = Array.isArray(props.post.likes) ? props.post.likes : [];
  const comments = Array.isArray(props.post.comments) ? props.post.comments : [];
  const initialLikedBy = Array.isArray(props.post.likedBy) ? props.post.likedBy : [];

  const [values, setValues] = useState({
    like: likes.indexOf(user1.id) !== -1,
    likes: likes.length,
    comments,
    likedBy: initialLikedBy,
  });

  const updateComments = (nextComments) => {
    setValues((currentValues) => ({
      ...currentValues,
      comments: Array.isArray(nextComments) ? nextComments : [],
    }));
  };

  const clickLike = () => {
    const callApi = values.like ? unlike : Like;

    callApi(
      { userId: user1.id },
      { t: jwt.token },
      props.post._id
    ).then((data) => {
      if (data?.likes) {
        setValues((currentValues) => ({
          ...currentValues,
          like: !currentValues.like,
          likes: data.likes.length,
          likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
        }));
      }
    });
  };

  const addComment = () => {
    if (!text.trim()) {
      return;
    }

    comment(
      {
        userId: user1.id,
      },
      {
        t: jwt.token,
      },
      props.post._id,
      { text: text.trim() }
    ).then((data) => {
      if (data) {
        setText("");
        setShowComments(true);
        updateComments(data.comments);
      }
    });
  };

  const deletePost = () => {
    remove({ postId: props.post._id }, { t: jwt.token }).then((data) => {
      if (data) {
        props.updatePosts(props.post);
      }
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addComment();
    }
  };

  const caption = props.post.caption || "";
  const displayedCaption =
    expandedCaption || caption.length <= 240
      ? caption
      : `${caption.substring(0, 240)}...`;
  const authorName = props.post.author?.name || "Creator";
  const authorImage = props.post.author?.image || DEFAULT_AVATAR;
  const authorId = props.post.userDetails?.id || props.post.author?._id;
  const createdAt = props.post.created || props.post.createdAt;

  return (
    <article className="glass-card feed-post-card">
      <div className="feed-post-header">
        <div
          className="feed-post-author"
          onClick={() => authorId && nav("/user/" + authorId)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" && authorId) {
              nav("/user/" + authorId);
            }
          }}
        >
          <img src={authorImage} alt={authorName} />
          <div>
            <p className="feed-post-name">{authorName}</p>
            <p className="feed-post-time">
              {createdAt ? new Date(createdAt).toLocaleString() : "Just now"}
            </p>
          </div>
        </div>

        {authorId === user1.id ? (
          <button
            type="button"
            className="feed-post-delete"
            onClick={deletePost}
            aria-label="Delete post"
          >
            <i className="fa-regular fa-trash-can" />
          </button>
        ) : null}
      </div>

      {caption ? (
        <p className="feed-post-caption">
          {displayedCaption}
          {caption.length > 240 && !expandedCaption ? (
            <>
              {" "}
              <button
                type="button"
                className="feed-post-caption-toggle"
                onClick={() => setExpandedCaption(true)}
              >
                show more
              </button>
            </>
          ) : null}
        </p>
      ) : null}

      {props.post.photo ? (
        <div className="feed-post-image-wrap">
          <img
            src={props.post.photo}
            alt={caption || "Post"}
            className="feed-post-image"
          />
        </div>
      ) : null}

      <div className="feed-post-actions">
        <div className="feed-post-action-list">
          <button
            type="button"
            className={`feed-action-btn ${values.like ? "active" : ""}`}
            onClick={clickLike}
          >
            <i
              className={`${values.like ? "fa-solid heart" : "fa-regular"} fa-heart`}
            />
            <span>{values.like ? "Liked" : "Like"}</span>
          </button>
          <button
            type="button"
            className="feed-action-btn"
            onClick={() => setShowComments((currentValue) => !currentValue)}
          >
            <i className="fa-regular fa-comment" />
            <span>Comment</span>
          </button>
        </div>

        <button
          type="button"
          className="feed-action-meta feed-action-meta-btn"
          onClick={() => setShowLikes((currentValue) => !currentValue)}
        >
          {values.likes} likes · {values.comments.length} comments
        </button>
      </div>

      {showLikes ? (
        <div className="feed-likes-panel">
          <div className="feed-likes-header">
            <strong>Liked by</strong>
            <span>{values.likedBy.length} people</span>
          </div>
          {values.likedBy.length > 0 ? (
            <div className="feed-likes-list">
              {values.likedBy.map((person) => (
                <button
                  type="button"
                  key={person._id}
                  className="feed-like-user"
                  onClick={() => nav("/user/" + person._id)}
                >
                  <img
                    src={person.image || DEFAULT_AVATAR}
                    alt={person.name}
                    className="feed-like-avatar"
                  />
                  <span className="feed-like-copy">
                    <strong>{person.name}</strong>
                    <span>{person.about || "ROHAINA member"}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="app-muted-text mb-0">
              Likes will appear here as soon as people react to this post.
            </p>
          )}
        </div>
      ) : null}

      {showComments ? (
        <Comment
          updateComments={updateComments}
          postId={props.post._id}
          comments={values.comments}
        />
      ) : null}

      <div className="feed-comment-form">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="form-control feed-comment-input"
          placeholder="Add a comment..."
          onKeyDown={handleKeyDown}
        />
        <button type="button" className="feed-comment-send" onClick={addComment}>
          Send
        </button>
      </div>
    </article>
  );
};

export default Posts;
