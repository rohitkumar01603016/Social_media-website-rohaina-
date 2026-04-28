import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import auth from "./../auth/auth-help";
import jwt1 from "jwt-decode";
import { fetchChats, read, searchuser } from "../api/api-post";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "../Context/ThemeProvider";

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-541.jpg";

const NavBar = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [open, setOpen] = useState(false);
  const [chatAlerts, setChatAlerts] = useState([]);
  const [messageAnchorEl, setMessageAnchorEl] = useState(null);
  const [values, setValues] = useState({
    id: "",
    image: DEFAULT_AVATAR,
  });

  const loading = searchResult.length !== 0 && open;
  const jwt = auth.isAuthenticated();
  const user1 = jwt1(jwt.token);
  const nav = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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

  useEffect(() => {
    let isMounted = true;

    const loadChatAlerts = () => {
      fetchChats(
        {
          userId: user1.id,
        },
        {
          t: jwt.token,
        }
      ).then((data) => {
        if (isMounted) {
          setChatAlerts(Array.isArray(data) ? data : []);
        }
      });
    };

    loadChatAlerts();
    const intervalId = window.setInterval(loadChatAlerts, 15000);
    const handleFocus = () => loadChatAlerts();

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [jwt.token, user1.id]);

  const activeHome = location.pathname === "/s";
  const activeChat = location.pathname.startsWith("/chat");
  const activeSupport = location.pathname === "/support";
  const displayName = user1.name?.split("@")[0] || user1.name || "Profile";
  const unreadChats = chatAlerts.filter((chat) => Number(chat.unreadCount) > 0);
  const unreadTotal = unreadChats.reduce(
    (currentValue, chat) => currentValue + (Number(chat.unreadCount) || 0),
    0
  );
  const isDarkTheme = theme === "dark";

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
                    className="rounded"
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
            className="nav-icon-btn"
            onClick={(event) => setMessageAnchorEl(event.currentTarget)}
            title="Unread messages"
            aria-label="Unread messages"
          >
            <Badge badgeContent={unreadTotal} color="error" max={99}>
              <i className="fa-regular fa-envelope" />
            </Badge>
          </button>
          <Menu
            anchorEl={messageAnchorEl}
            open={Boolean(messageAnchorEl)}
            onClose={() => setMessageAnchorEl(null)}
          >
            {unreadChats.length > 0 ? (
              unreadChats.slice(0, 6).map((chat) => {
                const otherUser = Array.isArray(chat.users)
                  ? chat.users.find((user) => user._id !== user1.id)
                  : null;

                return (
                  <MenuItem
                    key={chat._id}
                    onClick={() => {
                      setMessageAnchorEl(null);
                      nav(`/chat/join?userId=${otherUser?._id || ""}`);
                    }}
                  >
                    <div className="nav-unread-item">
                      <strong>{otherUser?.name || "Conversation"}</strong>
                      <span>{chat.unreadCount} unread message(s)</span>
                    </div>
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem onClick={() => setMessageAnchorEl(null)}>
                No unread messages
              </MenuItem>
            )}
          </Menu>
          <button
            type="button"
            className={`nav-icon-btn ${activeChat ? "active" : ""}`}
            onClick={() => nav("/chat/join")}
            title="Chat"
            aria-label="Chat"
          >
            <Badge badgeContent={unreadTotal} color="error" max={99}>
              <i className="fa-regular fa-paper-plane" />
            </Badge>
          </button>
          <button
            type="button"
            className={`nav-icon-btn ${activeSupport ? "active" : ""}`}
            onClick={() => nav("/support")}
            title="Support"
            aria-label="Support"
          >
            <i className="fa-solid fa-life-ring" />
          </button>
          <button
            type="button"
            className="nav-icon-btn"
            onClick={toggleTheme}
            title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
          >
            <i className={`fa-solid ${isDarkTheme ? "fa-sun" : "fa-moon"}`} />
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
