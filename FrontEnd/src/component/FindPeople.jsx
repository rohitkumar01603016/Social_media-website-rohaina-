import React, { useEffect, useState } from "react";
import auth from "./../auth/auth-help";
import jwt1 from "jwt-decode";
import { findPeoplee, follow } from "../api/api-post";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-541.jpg";

const FindPeople = () => {
  const nav = useNavigate();
  const [users, setUsers] = useState([]);

  const jwt = auth.isAuthenticated();
  const user1 = jwt1(jwt.token);

  useEffect(() => {
    const abortController = new AbortController();

    findPeoplee(
      {
        userId: user1.id,
      },
      {
        t: jwt.token,
      },
      abortController.signal
    ).then((data) => {
      if (data) {
        setUsers(data);
      }
    });

    return () => abortController.abort();
  }, [jwt.token, user1.id]);

  const clickFollow = (user, index) => {
    follow(
      {
        userId: user1.id,
      },
      {
        t: jwt.token,
      },
      user._id
    ).then((data) => {
      if (data) {
        setUsers((currentUsers) =>
          currentUsers.filter((_, currentIndex) => currentIndex !== index)
        );
        toast.success(`Following ${user.name}!`, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1000,
        });
      }
    });
  };

  return (
    <aside className="glass-card suggestions-card">
      <div className="app-section-heading">
        <div>
          <h3>Suggestions for you</h3>
          <p className="app-muted-text">
            Fresh people to bring into your ROHAINA circle.
          </p>
        </div>
      </div>

      <div className="suggestions-list">
        {users.length > 0 ? (
          users.map((user2, idx) => (
            <div key={user2._id} className="suggestion-item">
              <button
                type="button"
                className="suggestion-user"
                onClick={() => {
                  nav("/user/" + user2._id);
                }}
              >
                <span className="suggestion-avatar-wrap">
                  <img src={user2.image || DEFAULT_AVATAR} alt={user2.name} />
                </span>
                <span className="suggestion-copy">
                  <strong>{user2.name}</strong>
                  <span>@{(user2.email || user2.name || "creator").split("@")[0]}</span>
                </span>
              </button>

              <button
                type="button"
                className="follow-chip"
                onClick={() => {
                  clickFollow(user2, idx);
                }}
              >
                Follow
              </button>
            </div>
          ))
        ) : (
          <p className="app-muted-text mb-0">
            No fresh suggestions right now. Your next connections will appear
            here.
          </p>
        )}
      </div>
    </aside>
  );
};

export default FindPeople;
