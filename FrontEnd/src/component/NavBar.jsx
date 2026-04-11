import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import auth from "./../auth/auth-help";
import jwt1 from "jwt-decode";
import { read, searchuser } from "../api/api-post";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-541.jpg";

const NavBar = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    id: "",
    image: DEFAULT_AVATAR,
  });

  const loading = searchResult.length !== 0 && open;
  const jwt = auth.isAuthenticated();
  const user1 = jwt1(jwt.token);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    searchuser(
      {
        userId: user1.id,
      },
      {
        t: jwt.token,
      },
      {
        search,
      }
    ).then((data) => {
      if (search !== "") {
        setSearchResult(data);
      } else {
        setSearchResult([]);
      }
    });
  }, [jwt.token, search, user1.id]);

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
        setValues({
          id: data._id || "",
          image: data.image || DEFAULT_AVATAR,
        });
      }
    });
  }, [jwt.token, user1.id]);

  const activeHome = location.pathname === "/s";
  const activeChat = location.pathname.startsWith("/chat");
  const displayName = user1.name?.split("@")[0] || user1.name || "Profile";

  return (
    <nav className="rohaina-nav">
      <div className="container rohaina-nav-inner">
        <button
          type="button"
          className="brand-button"
          onClick={() => nav("/s")}
          aria-label="Go to ROHAINA home feed"
        >
          <span className="brand-mark">R</span>
          <span className="brand-copy">
            <span className="brand-name">ROHAINA</span>
            <span className="brand-tag">social studio</span>
          </span>
        </button>

        <div className="nav-center">
          <div className="nav-search-shell">
            <Stack sx={{ width: "100%" }}>
              <Autocomplete
                size="small"
                id="navbar-user-search"
                options={searchResult}
                loading={loading}
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                onChange={(event, value) => {
                  if (value) {
                    nav("/user/" + value._id);
                  }
                }}
                autoHighlight
                getOptionLabel={(option) => option.name}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...props}
                  >
                    <img
                      className="rounded-circle me-3"
                      loading="lazy"
                      width="32"
                      height="32"
                      src={option.image || DEFAULT_AVATAR}
                      alt={option.name}
                    />
                    {option.name}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    className="rounded bg-white"
                    sx={{ p: "0px" }}
                    size="small"
                    onChange={(event) => setSearch(event.target.value)}
                    {...params}
                    placeholder="Search creators or friends"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {loading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </Stack>
          </div>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className={`nav-icon-btn ${activeHome ? "active" : ""}`}
            onClick={() => nav("/s")}
            title="Home feed"
            aria-label="Home feed"
          >
            <i className="fa-solid fa-house" />
          </button>
          <button
            type="button"
            className={`nav-icon-btn ${activeChat ? "active" : ""}`}
            onClick={() => nav("/chat/join")}
            title="Chat"
            aria-label="Chat"
          >
            <i className="fa-regular fa-paper-plane" />
          </button>
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => {
              localStorage.removeItem("userInfo1");
              nav("/");
            }}
            title="Logout"
            aria-label="Logout"
          >
            <i className="fa-solid fa-right-from-bracket" />
          </button>
          <button
            type="button"
            className="nav-profile-chip"
            onClick={() => nav("/user/" + values.id)}
          >
            <img src={values.image || DEFAULT_AVATAR} alt="profile" />
            <span className="nav-user-name">{displayName}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
