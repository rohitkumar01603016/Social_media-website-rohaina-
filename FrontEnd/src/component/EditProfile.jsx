import React, { useEffect, useState } from "react";
import auth from "./../auth/auth-help";
import jwt1 from "jwt-decode";
import { read, update, changePasswordApi, deleteAccountApi } from "../api/api-post";
import { toast } from "react-toastify";
import BarLoader from "react-spinners/PulseLoader";
import { useParams } from "react-router";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const nav = useNavigate();
  const params = useParams();
  const [picLoading1, setPicLoading1] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: "",
    image: "",
    about: "",
    update: null,
  });
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    deletePassword: "",
  });

  const jwt = auth.isAuthenticated();
  const user1 = jwt1(jwt.token);

  useEffect(() => {
    read(
      { userId: user1.id },
      {
        t: jwt.token,
      }
    ).then((data) => {
      if (data) {
        setValues((currentValues) => ({
          ...currentValues,
          name: data.name || "",
          email: data.email || "",
          image: data.image || "",
          about: data.about || "",
          update: data.updated || null,
        }));
      }
    });
  }, [jwt.token, user1.id]);

  const ImageHander = (pics) => {
    setPicLoading1(true);
    if (!pics) {
      setPicLoading1(false);
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/webp") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dwjy0lwss");
      fetch("https://api.cloudinary.com/v1_1/dwjy0lwss/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setValues((currentValues) => ({
            ...currentValues,
            image: (data.secure_url || data.url).toString(),
          }));
          setPicLoading1(false);
        })
        .catch(() => {
          toast.error("Could not upload image", {
            position: toast.POSITION.TOP_LEFT,
            autoClose: 1000,
          });
          setPicLoading1(false);
        });
    } else {
      toast.error("Photo is invalid", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 1000,
      });
      setPicLoading1(false);
    }
  };

  const clickSubmit = () => {
    update(
      {
        userId: params.id,
      },
      {
        t: jwt.token,
      },
      {
        name: values.name,
        about: values.about,
        email: values.email,
        image: values.image,
      }
    ).then((data) => {
      if (data?.error) {
        toast.error(data.error, {
          position: toast.POSITION.TOP_LEFT,
          autoClose: 1200,
        });
        return;
      }

      toast.success("Profile updated", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 1000,
      });
      nav("/user/" + user1.id);
    });
  };

  const clickChangePassword = async () => {
    try {
      await changePasswordApi(
        { t: jwt.token },
        {
          currentPassword: security.currentPassword,
          newPassword: security.newPassword,
        }
      );
      toast.success("Password changed", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 1000,
      });
      setSecurity((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
      }));
    } catch (error) {
      toast.error(error.message || "Could not change password", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 1200,
      });
    }
  };

  const clickDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your account, posts, stories, and chats. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAccountApi(
        { userId: user1.id },
        { t: jwt.token },
        { password: security.deletePassword }
      );
      localStorage.removeItem("userInfo1");
      toast.success("Account deleted", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 1000,
      });
      nav("/");
    } catch (error) {
      toast.error(error.message || "Could not delete account", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 1200,
      });
    }
  };

  return (
    <div>
      <NavBar />
      <div className="d-flex flex-column py-5 align-items-center mt-5">
        <div className="d-flex flex-column align-items-center flex-lg-row align-items-lg-start m-auto">
          <div className="position-relative">
            <img
              src={values.image}
              alt=""
              className="rounded"
              style={{ width: 280 }}
            />
            <BarLoader loading={picLoading1} size={15} />
            <label htmlFor="file-input">
              <i className="fa-solid fa-camera fs-2 camera_icon" />
            </label>
            <input
              id="file-input"
              onChange={(e) => ImageHander(e.target.files[0])}
              accept="image/*"
              name="photo"
              type="file"
              className="d-none"
            />
          </div>

          <div style={{ width: 500 }} className="px-5 pt-4 pt-lg-0">
            <div className="mb-3">
              <label htmlFor="formGroupExampleInput" className="form-label">
                Name
              </label>
              <input
                onChange={(e) => setValues({ ...values, name: e.target.value })}
                value={values.name}
                type="text"
                className="form-control"
                id="formGroupExampleInput"
                placeholder="name..."
              />
            </div>
            <div className="mb-3">
              <label htmlFor="formGroupExampleInput2" className="form-label">
                About
              </label>
              <input
                value={values.about || ""}
                onChange={(e) => setValues({ ...values, about: e.target.value })}
                type="text"
                className="form-control"
                id="formGroupExampleInput2"
                placeholder="about.."
              />
            </div>
            <div className="mb-3">
              <label htmlFor="formGroupExampleInput3" className="form-label">
                Email
              </label>
              <input
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                type="email"
                className="form-control"
                id="formGroupExampleInput3"
                placeholder="email.."
              />
            </div>

            <div className="border rounded p-3 mb-4">
              <h5 className="mb-3">Change password</h5>
              <div className="mb-3">
                <label className="form-label">Current password</label>
                <input
                  type="password"
                  value={security.currentPassword}
                  onChange={(e) =>
                    setSecurity({ ...security, currentPassword: e.target.value })
                  }
                  className="form-control"
                  placeholder="current password"
                />
              </div>
              <div className="mb-2">
                <label className="form-label">New password</label>
                <input
                  type="password"
                  value={security.newPassword}
                  onChange={(e) =>
                    setSecurity({ ...security, newPassword: e.target.value })
                  }
                  className="form-control"
                  placeholder="new password"
                />
              </div>
              <button
                type="button"
                className="btn btn-outline-dark mt-2"
                onClick={clickChangePassword}
              >
                Update password
              </button>
            </div>

            <div className="d-flex justify-content-center mb-4">
              <button onClick={() => nav(-1)} type="button" className="btn btn-dark mt-2 px-4">
                Back To Profile
              </button>
              <button onClick={clickSubmit} type="button" className="btn btn-primary ml-2 mt-2 px-4">
                <i className="fa-solid fa-pen me-2" />
                Update
              </button>
            </div>

            <div className="border border-danger rounded p-3">
              <h5 className="text-danger mb-3">Danger zone</h5>
              <p className="text-muted">
                Delete your account permanently. This also removes your posts,
                stories, and personal chats.
              </p>
              <input
                type="password"
                value={security.deletePassword}
                onChange={(e) =>
                  setSecurity({ ...security, deletePassword: e.target.value })
                }
                className="form-control"
                placeholder="confirm your password"
              />
              <button
                type="button"
                className="btn btn-danger mt-3"
                onClick={clickDeleteAccount}
              >
                Delete my account
              </button>
            </div>

            <p className="mt-3 d-flex justify-content-center">
              last update : {values.update ? new Date(values.update).toLocaleString() : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
