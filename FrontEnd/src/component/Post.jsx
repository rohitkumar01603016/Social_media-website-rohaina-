import React, { useRef, useState } from "react";
import auth from "./../auth/auth-help";
import jwt1 from "jwt-decode";
import { create } from "../api/api-post";
import { toast } from "react-toastify";
import PulseLoader from "react-spinners/PulseLoader";
import BarLoader from "react-spinners/PulseLoader";

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-541.jpg";

const Post = (props1) => {
  const [Text, setText] = useState("");
  const [pic, setPic] = useState("");
  const [image, setImage] = useState();
  const [picLoading, setPicLoading] = useState(false);
  const [picLoading1, setPicLoading1] = useState(false);
  const fileInputRef = useRef(null);
  const jwt = auth.isAuthenticated();
  const user = jwt1(jwt.token);
  const currentUser = props1.currentUser || {};
  const displayName = currentUser.name || user.name || "there";
  const displayImage = currentUser.image || DEFAULT_AVATAR;

  const submitHandler = async (event) => {
    event.preventDefault();
    setPicLoading(true);

    if (!Text.trim() && !pic) {
      toast.warning("Please type something first", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 1000,
      });
      setPicLoading(false);
      return;
    }

    try {
      const postData = {
        Text: Text.trim(),
        pic,
        user,
      };

      const data = await create(
        {
          userId: user.id,
        },
        {
          t: jwt.token,
        },
        postData
      );

      if (!data) {
        throw new Error("Could not create post");
      }

      setPic("");
      setImage(undefined);
      setText("");
      props1.onAdd1(data);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while posting", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 1200,
      });
    } finally {
      setPicLoading(false);
    }
  };

  const ImageHander = (pics) => {
    setPicLoading1(true);

    if (!pics) {
      setPicLoading1(false);
      return;
    }

    if (pics.type && pics.type.startsWith("image/")) {
      setImage(pics);
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dwjy0lwss");

      fetch("https://api.cloudinary.com/v1_1/dwjy0lwss/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((result) => {
          const imageUrl = result.secure_url || result.url;
          setPic(imageUrl.toString());
          setPicLoading1(false);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Photo upload failed", {
            position: toast.POSITION.TOP_LEFT,
            autoClose: 1000,
          });
          setPicLoading1(false);
        });
    } else {
      toast.error("Please choose a valid image file", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 1000,
      });
      setPicLoading1(false);
    }
  };

  return (
    <section className="glass-card composer-card">
      <div className="composer-top">
        <img
          src={displayImage}
          alt={displayName}
          className="composer-avatar"
        />
        <div className="composer-copy">
          <h3>Share a moment</h3>
          <p>Post a thought, a photo, or a quick update for your circle.</p>
        </div>
      </div>

      <form onSubmit={submitHandler}>
        <textarea
          value={Text}
          rows={4}
          onChange={(e) => setText(e.target.value)}
          className="composer-textarea"
          placeholder={`What's happening today, ${displayName}?`}
        />

        {pic ? (
          <div className="composer-media-preview">
            <img src={pic} alt={image?.name || "Selected post"} />
            <div>
              <p className="composer-media-name mb-1">
                {image?.name || "Ready to post"}
              </p>
              <p className="composer-status mb-0">
                Your image has been uploaded and is ready to publish.
              </p>
            </div>
          </div>
        ) : null}

        <div className="composer-upload-row">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <label htmlFor="feed-photo-input" className="composer-upload-btn">
              <i className="fa-solid fa-camera-retro" />
              <span>Add photo</span>
            </label>
            <input
              ref={fileInputRef}
              id="feed-photo-input"
              onChange={(e) => ImageHander(e.target.files[0])}
              name="photo"
              accept="image/*"
              type="file"
              className="d-none"
            />
            {picLoading1 ? (
              <span className="composer-status d-flex align-items-center gap-2">
                <BarLoader loading={picLoading1} size={12} />
                Uploading image...
              </span>
            ) : (
              <span className="composer-status">
                Add a photo to make your post feel more alive.
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-3">
            <PulseLoader loading={picLoading} size={10} />
            <button type="submit" className="composer-submit-btn">
              Publish post
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Post;
