import React, { useState } from "react";
import { uncomment } from "../api/api-post";
import auth from "./../auth/auth-help";
import jwt1 from "jwt-decode";

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-541.jpg";

const Comment = (props) => {
  const [st] = useState(0);
  const [x, setx] = useState(2);
  const jwt = auth.isAuthenticated();
  const user1 = jwt1(jwt.token);

  const deleteComment = (comment) => () => {
    uncomment(
      {
        userId: user1.id,
      },
      {
        t: jwt.token,
      },
      props.postId,
      comment
    ).then((data) => {
      props.updateComments(data.comments);
    });
  };

  return (
    <div>
      {props.comments.length > 0 ? (
        <section className="feed-comment-list">
          {props.comments.slice(st, x).map((item, index) => {
            const commenter = item.commentedBy || {};
            const commentKey = item._id || `${commenter._id || "comment"}-${index}`;

            return (
              <div key={commentKey} className="feed-comment-item">
                <img
                  src={commenter.image || DEFAULT_AVATAR}
                  alt={commenter.name || "Commenter"}
                  className="feed-comment-avatar"
                />
                <div className="feed-comment-body">
                  <div className="feed-comment-meta">
                    <strong>{commenter.name || "User"}</strong>
                    {commenter._id === user1.id ? (
                      <button
                        type="button"
                        onClick={deleteComment(item)}
                        className="feed-comment-delete"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="mb-0 comment-text-sm">{item.text}</p>
                </div>
              </div>
            );
          })}
          {props.comments.length >= 2 ? (
            <button
              type="button"
              className="feed-show-more"
              onClick={() => setx(x + 4)}
            >
              Show more comments
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
};

export default Comment;
