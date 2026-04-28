import React, { useEffect, useRef, useState } from "react";
import auth from "./../auth/auth-help";
import jwt1 from "jwt-decode";
import "./chat.css";
import { io } from "socket.io-client";
import Menu from "@mui/material/Menu";
import GridLoader from "react-spinners/GridLoader";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import Badge from "@mui/material/Badge";
import MailIcon from "@mui/icons-material/Mail";
import {
  searchuser,
  getChat,
  setMessage,
  fetchChats,
  getMessage,
  markChatReadApi,
  markViewOnceMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
  read,
  archiveChatApi,
  setChatPasswordApi,
  removeChatPasswordApi,
  unlockChatApi,
  blockUserApi,
  unblockUserApi,
  moderateBlockUserApi,
} from "../api/api-post";
import { API_BASE_URL } from "../api/client";
import { getSender, getSenderFull, isSameSenderMargin, isSameUser } from "../config/chatLogic";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../Context/ThemeProvider";

let socket;
let selectedChatCompare;

const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-541.jpg";
const MAX_CHAT_MEDIA = 6;

const EMOJI_GROUPS = [
  {
    label: "Smileys",
    items: [
      "\u{1F600}", "\u{1F603}", "\u{1F604}", "\u{1F601}", "\u{1F606}", "\u{1F605}",
      "\u{1F923}", "\u{1F602}", "\u{1F642}", "\u{1F643}", "\u{1F609}", "\u{1F60A}",
      "\u{1F607}", "\u{1F970}", "\u{1F60D}", "\u{1F929}", "\u{1F618}", "\u{1F617}",
      "\u{263A}\u{FE0F}", "\u{1F61A}", "\u{1F619}", "\u{1F60B}", "\u{1F61B}", "\u{1F61C}",
      "\u{1F92A}", "\u{1F61D}", "\u{1F911}", "\u{1F917}", "\u{1F92D}", "\u{1F92B}",
      "\u{1F914}", "\u{1F910}", "\u{1F928}", "\u{1F60F}", "\u{1F612}", "\u{1F644}",
      "\u{1F62C}", "\u{1F924}", "\u{1F634}", "\u{1F637}", "\u{1F912}", "\u{1F915}",
      "\u{1F922}", "\u{1F92E}", "\u{1F927}", "\u{1F975}", "\u{1F976}", "\u{1F974}",
      "\u{1F60E}", "\u{1F913}", "\u{1F9D0}", "\u{1F615}", "\u{1F61F}", "\u{1F641}",
      "\u{2639}\u{FE0F}", "\u{1F62E}", "\u{1F62F}", "\u{1F632}", "\u{1F633}", "\u{1F97A}",
      "\u{1F622}", "\u{1F62D}", "\u{1F631}", "\u{1F616}", "\u{1F623}", "\u{1F61E}",
      "\u{1F613}", "\u{1F629}", "\u{1F62B}", "\u{1F624}", "\u{1F621}", "\u{1F92C}",
      "\u{1F608}",
    ],
  },
  {
    label: "Hands",
    items: [
      "\u{1F44B}", "\u{1F91A}", "\u{270B}", "\u{1F596}", "\u{1F44C}", "\u{1F90F}",
      "\u{270C}\u{FE0F}", "\u{1F91E}", "\u{1F91F}", "\u{1F918}", "\u{1F919}", "\u{1F44D}",
      "\u{1F44E}", "\u{1F44A}", "\u{1F91B}", "\u{1F44F}", "\u{1F64C}", "\u{1F450}",
      "\u{1F64F}", "\u{1F91D}", "\u{1F4AA}", "\u{1F64B}", "\u{1F926}", "\u{1F937}",
    ],
  },
  {
    label: "Love",
    items: [
      "\u{2764}\u{FE0F}", "\u{1F9E1}", "\u{1F49B}", "\u{1F49A}", "\u{1F499}", "\u{1F49C}",
      "\u{1F90E}", "\u{1F5A4}", "\u{1F497}", "\u{1F496}", "\u{1F495}", "\u{1F49E}",
      "\u{1F493}", "\u{1F494}", "\u{1F48C}", "\u{1F48B}", "\u{1F63B}", "\u{1F63D}",
      "\u{1F970}", "\u{1F60D}", "\u{1F618}", "\u{1F49F}",
    ],
  },
  {
    label: "Fun",
    items: [
      "\u{1F389}", "\u{1F38A}", "\u{1F973}", "\u{1F382}", "\u{1F381}", "\u{1F380}",
      "\u{1F451}", "\u{1F48E}", "\u{1F525}", "\u{2728}", "\u{1F31F}", "\u{2B50}",
      "\u{1F4AF}", "\u{1F680}", "\u{1F6A8}", "\u{1F388}", "\u{1F39F}", "\u{1F3C6}",
      "\u{1F947}", "\u{1F948}", "\u{1F949}", "\u{1F3AF}", "\u{1F3B5}", "\u{1F3A7}",
    ],
  },
  {
    label: "Animals",
    items: [
      "\u{1F436}", "\u{1F431}", "\u{1F42D}", "\u{1F439}", "\u{1F430}", "\u{1F98A}",
      "\u{1F43B}", "\u{1F43C}", "\u{1F428}", "\u{1F42F}", "\u{1F981}", "\u{1F42E}",
      "\u{1F437}", "\u{1F438}", "\u{1F435}", "\u{1F648}", "\u{1F649}", "\u{1F64A}",
      "\u{1F98B}", "\u{1F985}", "\u{1F986}", "\u{1F989}",
    ],
  },
  {
    label: "Food",
    items: [
      "\u{1F34E}", "\u{1F34F}", "\u{1F350}", "\u{1F34A}", "\u{1F353}", "\u{1F352}",
      "\u{1F951}", "\u{1F955}", "\u{1F954}", "\u{1F35F}", "\u{1F354}", "\u{1F355}",
      "\u{1F32D}", "\u{1F96A}", "\u{1F370}", "\u{1F36B}", "\u{1F36A}", "\u{1F36D}",
      "\u{1F382}", "\u{2615}", "\u{1F964}", "\u{1F37F}", "\u{1F379}", "\u{1F9CB}",
    ],
  },
];

const toIdString = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value._id) {
    return value._id.toString();
  }

  if (typeof value === "object" && value.id) {
    return value.id.toString();
  }

  return String(value);
};

const getMessageMedia = (message) => {
  if (Array.isArray(message?.images) && message.images.length > 0) {
    return message.images.filter(Boolean);
  }

  if (message?.image) {
    return [message.image];
  }

  return [];
};

const hasUserViewedMessage = (message, userId) => {
  if (!message?.viewOnce) {
    return false;
  }

  if (message?.viewOnceOpened) {
    return true;
  }

  if (!Array.isArray(message?.viewedBy)) {
    return false;
  }

  return message.viewedBy.some((item) => toIdString(item) === userId);
};

const formatLastSeen = (value) => {
  if (!value) {
    return "Offline";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Offline";
  }

  const now = new Date();
  const isToday =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  if (isToday) {
    return `Last seen today at ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return `Last seen ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} at ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const getLatestMessagePreview = (message, userId) => {
  if (!message) {
    return "";
  }

  if (
    Array.isArray(message.deletedFor) &&
    message.deletedFor.some((item) => toIdString(item) === userId)
  ) {
    return "";
  }

  if (message.deletedForEveryone) {
    return "This message was deleted";
  }

  if (message.content) {
    return message.content;
  }

  const mediaItems = getMessageMedia(message);

  if (message.viewOnce && hasUserViewedMessage(message, userId)) {
    return "Opened photo";
  }

  if (mediaItems.length > 1) {
    return `${mediaItems.length} photos`;
  }

  if (mediaItems.length === 1) {
    return message.viewOnce ? "View once photo" : "Photo";
  }

  return "";
};

const formatMessageTime = (value) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const Join = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [open, setOpen] = useState(false);
  const [value1, setValue1] = useState({});
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);
  const [chat, setChat] = useState(null);
  const [selectChat, setSelectChat] = useState(false);
  const [socketcon, Setsocketc] = useState(false);
  const [loading1, Setloading1] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [viewOnceEnabled, setViewOnceEnabled] = useState(false);
  const [mediaViewer, setMediaViewer] = useState({
    open: false,
    images: [],
    index: 0,
    viewOnce: false,
    title: "",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [messageMenuAnchorEl, setMessageMenuAnchorEl] = useState(null);
  const [selectedMessageAction, setSelectedMessageAction] = useState(null);
  const [fetchAgain, setFetchAgain] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  const [unlockedChats, setUnlockedChats] = useState({});
  const [ChatColor, setChatColor] = useState("white");
  const [Color3, setColor3] = useState("white");
  const [TextColor, setTextC] = useState("black");
  const [Color4, setColor4] = useState("#dee2e6");
  const [STextColor, setStext] = useState("gray");
  const [backim, setbsckim] = useState("123.png");
  const [fchatc, setf] = useState("#b8ebb4");
  const [schatc, setsc] = useState("white");
  const [ima, setim] = useState("123.png");

  const jwt = auth.isAuthenticated();
  const user1 = jwt1(jwt.token);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const loading = searchResult.length !== 0 && open;
  const open1 = Boolean(anchorEl);
  const messageMenuOpen = Boolean(messageMenuAnchorEl);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedMediaRef = useRef([]);
  const activeChatUserNameRef = useRef("");
  const autoOpenedQueryChatRef = useRef("");
  const openSelectedChatRef = useRef(null);
  const syncChatReadStateRef = useRef(null);

  const getAvatar = (user) => user?.image || DEFAULT_AVATAR;
  const isSelectedUserBlocked = Array.isArray(currentUserProfile?.blockedUsers)
    ? currentUserProfile.blockedUsers.some(
        (item) => toIdString(item) === toIdString(selectedProfile?._id)
      )
    : false;
  const hasSelectedUserBlockedMe = Array.isArray(selectedProfile?.blockedUsers)
    ? selectedProfile.blockedUsers.some((item) => toIdString(item) === user1.id)
    : false;
  const chatBlockedForMessaging = isSelectedUserBlocked || hasSelectedUserBlockedMe;

  const refreshCurrentUserProfile = async () => {
    const profile = await read(
      { userId: user1.id },
      { t: jwt.token }
    );

    if (profile) {
      setCurrentUserProfile(profile);
    }
  };

  const openProfilePanel = async (userLike) => {
    const userId = toIdString(userLike?._id || userLike?.id);

    if (!userId) {
      return;
    }

    const profile = await read(
      { userId },
      { t: jwt.token }
    );

    if (profile) {
      setSelectedProfile(profile);
      setShowProfilePanel(true);
    }
  };

  const clearNotificationsForChat = (chatId) => {
    const chatIdString = toIdString(chatId);

    setNotification((currentNotification) =>
      currentNotification.filter(
        (item) => toIdString(item.chat?._id || item.chat) !== chatIdString
      )
    );
  };

  const syncChatReadState = async (chatId) => {
    if (!chatId) {
      return;
    }

    try {
      await markChatReadApi(
        { chatId },
        { t: jwt.token }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const ensureChatUnlocked = async (targetChat) => {
    if (!targetChat?.passwordProtected) {
      return true;
    }

    const chatId = targetChat._id || targetChat.id;

    if (unlockedChats[chatId]) {
      return true;
    }

    const password = window.prompt("This chat is locked. Enter its password.");

    if (password === null) {
      return false;
    }

    await unlockChatApi(
      { chatId },
      { t: jwt.token },
      password
    );

    setUnlockedChats((currentValue) => ({
      ...currentValue,
      [chatId]: true,
    }));

    return true;
  };

  const openChatWindow = async (targetChat, targetUser) => {
    try {
      const canOpen = await ensureChatUnlocked(targetChat);

      if (!canOpen) {
        return;
      }

      Setloading1(true);
      setTimeout(() => {
        Setloading1(false);
        setSelectChat(true);
        setValue1(targetUser);
        setChat(targetChat);
        setShowProfilePanel(false);
      }, 250);
      clearNotificationsForChat(targetChat?._id);
    } catch (error) {
      alert(error.message || "Could not unlock this chat");
    }
  };

  const cleanupPreviewUrls = (mediaItems) => {
    mediaItems.forEach((item) => {
      if (item?.preview && item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
    });
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openMessageMenu = (event, message) => {
    setMessageMenuAnchorEl(event.currentTarget);
    setSelectedMessageAction(message);
  };

  const closeMessageMenu = () => {
    setMessageMenuAnchorEl(null);
    setSelectedMessageAction(null);
  };

  const handleClose1 = async (notiy) => {
    setAnchorEl(null);
    const targetUser = getSenderFull(user1, notiy.chat.users);
    const canOpen = await ensureChatUnlocked(notiy.chat);

    if (!canOpen) {
      return;
    }

    setSelectChat(true);
    setValue1(targetUser);
    setChat(notiy.chat);
    setShowProfilePanel(false);
    clearNotificationsForChat(notiy.chat?._id);
  };

  const appendEmoji = (emoji) => {
    setNewMessage((currentValue) => `${currentValue}${emoji}`);
  };

  const clearSelectedMedia = () => {
    cleanupPreviewUrls(selectedMediaRef.current);
    selectedMediaRef.current = [];
    setSelectedMedia([]);
    setViewOnceEnabled(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedMedia = (mediaId) => {
    setSelectedMedia((currentMedia) => {
      const targetMedia = currentMedia.find((item) => item.id === mediaId);

      if (targetMedia?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(targetMedia.preview);
      }

      const nextMedia = currentMedia.filter((item) => item.id !== mediaId);
      selectedMediaRef.current = nextMedia;
      return nextMedia;
    });
  };

  const closeMediaViewer = () => {
    setMediaViewer({
      open: false,
      images: [],
      index: 0,
      viewOnce: false,
      title: "",
    });
  };

  const uploadChatImage = async (file) => {
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
      throw new Error(result.error?.message || "Could not upload image");
    }

    return imageUrl.toString();
  };

  const applyPresenceToUser = (user, payload) => {
    if (!user) {
      return user;
    }

    const userId = toIdString(user._id || user.id);

    if (userId !== payload.userId) {
      return user;
    }

    return {
      ...user,
      isOnline: payload.isOnline,
      lastSeen: payload.lastSeen,
    };
  };

  const openSelectedChat = async (selectedUser) => {
    if (!selectedUser) return;

    Setloading1(true);
    setValue1(selectedUser);

    const data = await getChat(
      { userId: user1.id },
      { t: jwt.token },
      selectedUser._id
    );

    if (data) {
      const targetUser = getSenderFull(user1, data.users);
      const canOpen = await ensureChatUnlocked(data);

      if (!canOpen) {
        Setloading1(false);
        return;
      }

      setSelectChat(true);
      setValue1(targetUser);
      setChat(data);
      setShowProfilePanel(false);
      clearNotificationsForChat(data?._id);
    }

    Setloading1(false);
  };
  openSelectedChatRef.current = openSelectedChat;
  syncChatReadStateRef.current = syncChatReadState;

  useEffect(() => {
    const requestedUserId = searchParams.get("userId");

    if (!requestedUserId || requestedUserId === user1.id) {
      return;
    }

    if (autoOpenedQueryChatRef.current === requestedUserId) {
      return;
    }

    autoOpenedQueryChatRef.current = requestedUserId;

    read(
      { userId: requestedUserId },
      { t: jwt.token }
    ).then((profile) => {
      if (profile?._id) {
        openSelectedChatRef.current?.(profile);
      }
    });
  }, [jwt.token, searchParams, user1.id]);

  const applyDeletedMessage = (message, userId) => ({
    ...message,
    content: "",
    image: "",
    images: [],
    viewOnce: false,
    viewedBy: [],
    deletedForEveryone: true,
    deletedAt: new Date().toISOString(),
    viewOnceOpened:
      toIdString(message.sender?._id || message.sender) !== userId,
  });

  const handleDeleteForEveryone = async (messageId) => {
    try {
      closeMessageMenu();
      const deletedMessage = await deleteMessageForEveryone(
        { messageId },
        { t: jwt.token }
      );

      setMessages((currentMessages) =>
        currentMessages.map((item) =>
          item._id === messageId ? applyDeletedMessage(item, user1.id) : item
        )
      );
      setFetchAgain((currentValue) => !currentValue);

      if (socket) {
        socket.emit("delete message", deletedMessage);
      }
    } catch (error) {
      alert(error.message || "Could not delete message for everyone");
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await deleteMessageForMe(
        { messageId },
        { t: jwt.token }
      );

      setMessages((currentMessages) =>
        currentMessages.filter((item) => item._id !== messageId)
      );
      closeMessageMenu();
    } catch (error) {
      alert(error.message || "Could not delete message for you");
    }
  };

  const handleToggleBlockUser = async () => {
    const targetUserId = toIdString(selectedProfile?._id);

    if (!targetUserId) {
      return;
    }

    try {
      if (isSelectedUserBlocked) {
        await unblockUserApi({ t: jwt.token }, targetUserId);
      } else {
        await blockUserApi({ t: jwt.token }, targetUserId);
      }

      await refreshCurrentUserProfile();
      await openProfilePanel(selectedProfile);
      setFetchAgain((currentValue) => !currentValue);
    } catch (error) {
      alert(error.message || "Could not update block status");
    }
  };

  const handleModerateAndBlock = async () => {
    if (!selectedMessageAction?.content) {
      return;
    }

    try {
      const response = await moderateBlockUserApi(
        { t: jwt.token },
        {
          targetUserId: toIdString(selectedMessageAction.sender?._id || selectedMessageAction.sender),
          message: selectedMessageAction.content,
        }
      );

      await refreshCurrentUserProfile();

      if (response.blocked) {
        alert(response.moderation?.reason || "Sender has been blocked.");
      } else {
        alert(response.moderation?.reason || "Message was analyzed and not auto-blocked.");
      }

      closeMessageMenu();
    } catch (error) {
      alert(error.message || "Could not analyze this message");
    }
  };

  const handleArchiveCurrentChat = async () => {
    const chatId = chat?._id;

    if (!chatId) {
      return;
    }

    try {
      const response = await archiveChatApi({ chatId }, { t: jwt.token });
      setChat((currentChat) =>
        currentChat
          ? {
              ...currentChat,
              archivedForCurrentUser: response.archived,
            }
          : currentChat
      );
      setFetchAgain((currentValue) => !currentValue);
      setShowArchivedChats(true);
    } catch (error) {
      alert(error.message || "Could not archive this chat");
    }
  };

  const handleSetChatPassword = async () => {
    const chatId = chat?._id;

    if (!chatId) {
      return;
    }

    const password = window.prompt("Set a password for this chat (minimum 4 characters)");

    if (password === null) {
      return;
    }

    try {
      await setChatPasswordApi({ chatId }, { t: jwt.token }, password);
      setUnlockedChats((currentValue) => ({
        ...currentValue,
        [chatId]: true,
      }));
      setChat((currentChat) =>
        currentChat
          ? {
              ...currentChat,
              passwordProtected: true,
            }
          : currentChat
      );
      setFetchAgain((currentValue) => !currentValue);
    } catch (error) {
      alert(error.message || "Could not protect this chat");
    }
  };

  const handleRemoveChatPassword = async () => {
    const chatId = chat?._id;

    if (!chatId) {
      return;
    }

    try {
      await removeChatPasswordApi({ chatId }, { t: jwt.token });
      setUnlockedChats((currentValue) => {
        const nextValue = { ...currentValue };
        delete nextValue[chatId];
        return nextValue;
      });
      setChat((currentChat) =>
        currentChat
          ? {
              ...currentChat,
              passwordProtected: false,
            }
          : currentChat
      );
      setFetchAgain((currentValue) => !currentValue);
    } catch (error) {
      alert(error.message || "Could not remove chat password");
    }
  };

  const handleOpenMessageMedia = async (message, startIndex = 0) => {
    const mediaItems = getMessageMedia(message);

    if (!mediaItems.length) {
      return;
    }

    const isOwnMessage = toIdString(message.sender?._id || message.sender) === user1.id;
    const alreadyViewed = hasUserViewedMessage(message, user1.id);

    if (message.viewOnce && !isOwnMessage && alreadyViewed) {
      return;
    }

    if (message.viewOnce && !isOwnMessage) {
      try {
        await markViewOnceMessage(
          { messageId: message._id },
          { t: jwt.token }
        );

        setMessages((currentMessages) =>
          currentMessages.map((item) => {
            if (item._id !== message._id) {
              return item;
            }

            return {
              ...item,
              viewedBy: [...(item.viewedBy || []), user1.id],
              viewOnceOpened: true,
              image: "",
              images: [],
            };
          })
        );
        setFetchAgain((currentValue) => !currentValue);
      } catch (error) {
        alert(error.message || "Could not open view-once photo");
        return;
      }
    }

    setMediaViewer({
      open: true,
      images: mediaItems,
      index: startIndex,
      viewOnce: Boolean(message.viewOnce),
      title: message.sender?.name || value1?.name || "Photo",
    });
  };

  const PostMessage = async () => {
    const activeChatId = chat?._id || chat?.id || chat?.chatId;

    if (!activeChatId) {
      alert("Please reopen the chat and try again.");
      return;
    }

    if (chatBlockedForMessaging) {
      alert("Messaging is unavailable for this chat.");
      return;
    }

    if (!newMessage.trim() && selectedMedia.length === 0) return;

    const textToSend = newMessage.trim();
    let uploadedImages = [];

    try {
      if (selectedMedia.length > 0) {
        setImageUploading(true);
        uploadedImages = await Promise.all(
          selectedMedia.map((item) => uploadChatImage(item.file))
        );
      }

      socket.emit("stop typing", activeChatId);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      const data = await setMessage(
        {
          id: user1.id,
          chatId: activeChatId,
          content: textToSend,
          image: uploadedImages[0] || "",
          images: uploadedImages,
          viewOnce: viewOnceEnabled,
        },
        {
          t: jwt.token,
        }
      );

      if (!data) {
        throw new Error("Could not send message");
      }

      setNewMessage("");
      setShowEmojiPicker(false);
      setTyping(false);
      clearSelectedMedia();
      socket.emit("new message", data);
      setMessages((currentMessages) => [...currentMessages, data]);
      setFetchAgain((currentValue) => !currentValue);
    } catch (error) {
      console.log(error);
      alert(error.message || "Could not send media");
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageSelection = (event) => {
    const incomingFiles = Array.from(event.target.files || []);

    if (incomingFiles.length === 0) {
      return;
    }

    const availableSlots = MAX_CHAT_MEDIA - selectedMediaRef.current.length;

    if (availableSlots <= 0) {
      alert(`You can send up to ${MAX_CHAT_MEDIA} photos at once.`);
      event.target.value = "";
      return;
    }

    const acceptedFiles = [];

    incomingFiles.slice(0, availableSlots).forEach((file) => {
      if (file.type && !file.type.startsWith("image/")) {
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        return;
      }

      acceptedFiles.push(file);
    });

    if (acceptedFiles.length === 0) {
      alert("Please choose image files smaller than 10MB.");
      event.target.value = "";
      return;
    }

    const mediaToAdd = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedMedia((currentMedia) => {
      const nextMedia = [...currentMedia, ...mediaToAdd];
      selectedMediaRef.current = nextMedia;
      return nextMedia;
    });
    setShowEmojiPicker(false);
    event.target.value = "";
  };

  useEffect(() => {
    searchuser(
      {
        userId: user1.id,
      },
      {
        t: jwt.token,
      },
      {
        search: search,
      }
    ).then((data) => {
      if (search !== "") setSearchResult(data);
      else setSearchResult([]);
    });
  }, [jwt.token, search, user1.id]);

  useEffect(() => {
    read(
      { userId: user1.id },
      { t: jwt.token }
    ).then((profile) => {
      if (profile) {
        setCurrentUserProfile(profile);
      }
    });
  }, [jwt.token, user1.id]);

  useEffect(() => {
    if (!selectChat || !chat?._id) return;

    const loadMessages = async () => {
      try {
        const data = await getMessage(
          {
            userId: user1.id,
          },
          {
            t: jwt.token,
          },
          chat._id
        );

        setMessages(data);
        await syncChatReadStateRef.current?.(chat._id);
        clearNotificationsForChat(chat._id);
        setFetchAgain((currentValue) => !currentValue);
        socket.emit("join chat", chat._id);
      } catch (error) {
        console.log(error);
      }
    };

    loadMessages();
    selectedChatCompare = chat;
  }, [chat, jwt.token, selectChat, user1.id]);

  useEffect(() => {
    socket = io(API_BASE_URL || undefined);

    const handlePresenceUpdate = (payload) => {
      if (!payload?.userId) {
        return;
      }

      setValue1((currentUser) => applyPresenceToUser(currentUser, payload));
      setSearchResult((currentUsers) =>
        currentUsers.map((user) => applyPresenceToUser(user, payload))
      );
      setChats((currentChats) =>
        currentChats.map((currentChat) => ({
          ...currentChat,
          users: Array.isArray(currentChat.users)
            ? currentChat.users.map((user) => applyPresenceToUser(user, payload))
            : currentChat.users,
        }))
      );
      setNotification((currentNotification) =>
        currentNotification.map((item) => ({
          ...item,
          chat: {
            ...item.chat,
            users: Array.isArray(item.chat?.users)
              ? item.chat.users.map((user) => applyPresenceToUser(user, payload))
              : item.chat?.users,
          },
        }))
      );
      setMessages((currentMessages) =>
        currentMessages.map((message) => ({
          ...message,
          sender: applyPresenceToUser(message.sender, payload),
        }))
      );
    };

    const handleTyping = (payload) => {
      if (payload?.userId === user1.id) {
        return;
      }

      setIsTyping(true);
      setTypingUserName(payload?.name || activeChatUserNameRef.current || "Someone");
    };

    const handleStopTyping = (payload) => {
      if (payload?.userId === user1.id) {
        return;
      }

      setIsTyping(false);
      setTypingUserName("");
    };

    socket.on("connected", () => Setsocketc(true));
    socket.on("presence update", handlePresenceUpdate);
    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);
    socket.on("message deleted", (deletedMessage) => {
      setMessages((currentMessages) =>
        currentMessages.map((item) =>
          item._id === deletedMessage._id ? applyDeletedMessage(item, user1.id) : item
        )
      );
      setFetchAgain((currentValue) => !currentValue);
    });
    socket.emit("setup", jwt1(jwt.token));

    return () => {
      socket.off("connected");
      socket.off("presence update", handlePresenceUpdate);
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
      socket.off("message deleted");
      socket.disconnect();
    };
  }, [jwt.token, user1.id]);

  useEffect(() => {
    fetchChats(
      {
        userId: user1.id,
      },
      {
        t: jwt.token,
      }
    ).then((data) => {
      if (data) setChats(data);
    });
  }, [fetchAgain, jwt.token, user1.id, socketcon]);

  useEffect(() => {
    if (!selectChat || !chat?._id) {
      return;
    }

    const currentChat = chats.find((item) => item._id === chat._id);

    if (!currentChat) {
      return;
    }

    setValue1(getSenderFull({ id: user1.id }, currentChat.users));
  }, [chats, chat?._id, selectChat, user1.id]);

  useEffect(() => {
    if (!socketcon) return;

    const handleMessageReceived = (newMessageRecieved) => {
      const receivedChatId = toIdString(
        newMessageRecieved.chat?._id || newMessageRecieved.chat
      );
      const activeChatId = toIdString(selectedChatCompare?._id);

      if (
        !selectedChatCompare ||
        activeChatId !== receivedChatId
      ) {
        setNotification((currentNotification) => {
          const alreadyPresent = currentNotification.some(
            (item) => item._id === newMessageRecieved._id
          );

          return alreadyPresent
            ? currentNotification
            : [newMessageRecieved, ...currentNotification];
        });
      } else {
        const readMessage = {
          ...newMessageRecieved,
          readBy: [...new Set([...(newMessageRecieved.readBy || []), user1.id])],
        };

        setMessages((currentMessages) => [...currentMessages, readMessage]);
        clearNotificationsForChat(receivedChatId);
        syncChatReadStateRef.current?.(receivedChatId);
      }

      setFetchAgain((currentValue) => !currentValue);
    };

    socket.on("message recieved", handleMessageReceived);

    return () => {
      socket.off("message recieved", handleMessageReceived);
    };
  }, [jwt.token, socketcon, user1.id]);

  useEffect(() => {
    selectedMediaRef.current = selectedMedia;

    if (selectedMedia.length === 0) {
      setViewOnceEnabled(false);
    }
  }, [selectedMedia]);

  useEffect(() => {
    activeChatUserNameRef.current = value1?.name || "";
  }, [value1?.name]);

  useEffect(() => {
    cleanupPreviewUrls(selectedMediaRef.current);
    selectedMediaRef.current = [];
    setSelectedMedia([]);
    setViewOnceEnabled(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    closeMediaViewer();
    setIsTyping(false);
    setTypingUserName("");
  }, [chat?._id]);

  const change = (mode) => {
    if (mode === "dark") {
      setChatColor("#18242d");
      setColor3("#101920");
      setTextC("#eff5f8");
      setColor4("#0f171d");
      setStext("#9fb0bb");
      setbsckim("jbVvEcAi.jpg");
      setf("#28524d");
      setsc("#1f2d37");
      setim("jbVvEcAi.jpg");
    } else {
      setChatColor("#ffffff");
      setColor3("#ffffff");
      setim("123.png");
      setTextC("#1c2730");
      setColor4("#eef1f5");
      setStext("#5f6f7b");
      setbsckim("123.png");
      setf("#b8ebb4");
      setsc("#ffffff");
    }
  };

  useEffect(() => {
    change(theme);
  }, [theme]);

  const typingHandler = (e) => {
    const activeChatId = chat?._id || chat?.id || chat?.chatId;

    if (chatBlockedForMessaging) {
      return;
    }

    setNewMessage(e.target.value);

    if (!socketcon || !activeChatId) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", activeChatId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", activeChatId);
      setTyping(false);
    }, 3000);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      PostMessage();
    }
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      cleanupPreviewUrls(selectedMediaRef.current);
    };
  }, []);

  const selectedUserStatusText = istyping
    ? `${typingUserName || value1?.name || "Someone"} is typing...`
    : value1?.isOnline
      ? "Online"
      : formatLastSeen(value1?.lastSeen);
  const totalUnreadCount = chats.reduce(
    (currentValue, singleChat) =>
      currentValue + (Number(singleChat.unreadCount) || 0),
    0
  );
  const unreadChats = chats.filter((singleChat) => Number(singleChat.unreadCount) > 0);
  const visibleChats = chats.filter((singleChat) =>
    showArchivedChats
      ? Boolean(singleChat.archivedForCurrentUser)
      : !singleChat.archivedForCurrentUser
  );
  const activeChatBackground =
    theme === "dark"
      ? `linear-gradient(180deg, rgba(9, 15, 19, 0.74) 0%, rgba(12, 18, 24, 0.82) 100%), url(../images/${backim})`
      : `linear-gradient(180deg, rgba(255, 255, 255, 0.66) 0%, rgba(244, 247, 250, 0.78) 100%), url(../images/${backim})`;
  const emptyChatBackground =
    theme === "dark"
      ? `linear-gradient(180deg, rgba(9, 15, 19, 0.78) 0%, rgba(12, 18, 24, 0.86) 100%), url(../images/${ima})`
      : `linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(244, 247, 250, 0.82) 100%), url(../images/${ima})`;

  return (
    <div>
      <div>
        <section className="vh-100 d-flex grey2 chat-layout">
          <div
            className={`col-4 p-0 h-100 chat-sidebar-pane ${selectChat ? "chat-sidebar-pane-hidden" : ""}`}
            style={{ backgroundColor: `${Color4}` }}
          >
            <div
              className="justify-content-between border p-3 d-flex align-items-start grey"
              style={{ backgroundColor: `${Color3}`, color: `${TextColor}` }}
            >
              <div className="chat-sidebar-top">
                <button
                  type="button"
                  className="chat-home-link"
                  onClick={() => nav("/s")}
                >
                  <i className="fa-solid fa-arrow-left-long" />
                  <span>Back to feed</span>
                </button>
                <div className="brand-inline mt-3">
                  <span className="brand-mark small">R</span>
                  <span className="brand-copy">
                    <span className="brand-name">ROHAINA</span>
                    <span className="brand-tag">chat lounge</span>
                  </span>
                </div>
              </div>

              <div className="rounded input-group m-0 ps-3 pe-5">
                <Stack spacing={1} sx={{ width: 100 }}>
                  <Autocomplete
                    className="rounded"
                    size="small"
                    id="asynchronous-demo"
                    sx={{ width: 250 }}
                    options={searchResult}
                    loading={loading}
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    onChange={(event, value) => openSelectedChat(value)}
                    autoHighlight
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                        {...props}
                      >
                        <div className="chat-option-avatar">
                          <img
                            className="rounded-circle me-3"
                            loading="lazy"
                            width="30"
                            height="30"
                            src={getAvatar(option)}
                            alt=""
                          />
                          <span
                            className={`chat-status-dot ${option?.isOnline ? "online" : "offline"}`}
                          />
                        </div>
                        {option.name}
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        className="rounded chat-search-field"
                        sx={{ p: "0px" }}
                        size="small"
                        onChange={(e) => setSearch(e.target.value)}
                        {...params}
                        placeholder="Search people to chat"
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

              <div className="ml-2">
                <Stack spacing={4} direction="row" sx={{ color: "action.active" }}>
                  <Badge
                    id="fade-button"
                    aria-controls={open1 ? "fade-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open1 ? "true" : undefined}
                    onClick={handleClick}
                    color="secondary"
                    badgeContent={Math.max(notification.length, totalUnreadCount)}
                  >
                    <MailIcon color="primary" fontSize="large" />
                  </Badge>
                </Stack>

                <Menu
                  id="fade-menu"
                  MenuListProps={{
                    "aria-labelledby": "fade-button",
                  }}
                  anchorEl={anchorEl}
                  open={open1}
                  onClose={handleClose}
                  TransitionComponent={Fade}
                >
                  {notification.length === 0 && unreadChats.length === 0 ? (
                    <MenuItem onClick={handleClose}>No unread messages</MenuItem>
                  ) : (
                    <div>
                      {notification.length > 0
                        ? notification.map((notify) => (
                            <MenuItem key={notify._id} onClick={() => handleClose1(notify)}>
                              <div className="chat-notification-item">
                                <strong>{getSender(user1, notify.chat.users)}</strong>
                                <span>{getLatestMessagePreview(notify, user1.id) || "New message"}</span>
                              </div>
                            </MenuItem>
                          ))
                        : unreadChats.map((singleChat) => {
                            const chatUser = getSenderFull(user1, singleChat.users);

                            return (
                              <MenuItem
                                key={singleChat._id}
                                onClick={() => {
                                  handleClose();
                                  openChatWindow(singleChat, chatUser);
                                }}
                              >
                                <div className="chat-notification-item">
                                  <strong>{getSender(user1, singleChat.users)}</strong>
                                  <span>{singleChat.unreadCount} unread message(s)</span>
                                </div>
                              </MenuItem>
                            );
                          })}
                    </div>
                  )}
                </Menu>
              </div>
            </div>

            <div className="justify-content-center scroll overflow-auto px-3 mt-2">
              <div className="mb-2 chat-sidebar-toolbar">
                <button
                  type="button"
                  className="chat-sidebar-toggle-btn mb-1"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
                <button
                  type="button"
                  className="chat-sidebar-toggle-btn mb-1 ms-2"
                  onClick={() => setShowArchivedChats((currentValue) => !currentValue)}
                >
                  {showArchivedChats ? "Show inbox" : "Show archived"}
                </button>
              </div>

              {visibleChats.map((singleChat) => {
                const chatUser = getSenderFull(user1, singleChat.users);

                return (
                  <div key={singleChat._id}>
                    {singleChat.latestMessage ? (
                      <div
                        className={`d-flex align-items-center justify-content-between px-3 py-1 hovering shadow-sm mb-1 border-radius chat-thread-card ${singleChat.hasUnread ? "unread" : ""}`}
                        onClick={() => openChatWindow(singleChat, chatUser)}
                        style={{
                          backgroundColor: `${ChatColor}`,
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="chat-list-avatar-wrap">
                            <img
                              src={getAvatar(chatUser)}
                              alt=""
                              className="rounded-circle me-3"
                              width="50px"
                              height="50px"
                            />
                            <span
                              className={`chat-status-dot ${chatUser?.isOnline ? "online" : "offline"}`}
                            />
                          </div>
                          <div className="mt-3">
                            <h6
                              style={{ color: `${TextColor}` }}
                              className={`m-0 text-lg-left font-weight-bold ${singleChat.hasUnread ? "chat-thread-title-unread" : ""}`}
                            >
                              {getSender(user1, singleChat.users)}
                              {singleChat.passwordProtected ? (
                                <span className="chat-chat-chip ms-2">Locked</span>
                              ) : null}
                            </h6>
                            <p
                              style={{ color: `${STextColor}` }}
                              className={`chat-preview-text ${singleChat.hasUnread ? "unread" : ""}`}
                            >
                              {getLatestMessagePreview(singleChat.latestMessage, user1.id)}
                            </p>
                          </div>
                        </div>
                        <div className="chat-thread-meta">
                          <p
                            className="m-0 mb-2"
                            style={{ color: `${STextColor}` }}
                          >
                            {new Date(singleChat.latestMessage.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                          {singleChat.unreadCount > 0 ? (
                            <span className="chat-unread-pill">
                              {singleChat.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {selectChat ? (
            <div className="col-8 h-100 p-0 chat-content-pane">
              <div
                style={{
                  backgroundColor: `${Color3}`,
                }}
                className="d-flex ps-3 pe-4 py-3 border justify-content-between"
              >
                <button
                  type="button"
                  className="d-flex chat-user-trigger"
                  onClick={() => openProfilePanel(value1)}
                >
                  <div className="chat-header-avatar-wrap">
                    <img
                      src={getAvatar(value1)}
                      alt=""
                      className="rounded-circle me-2"
                      width="40px"
                      height="40px"
                    />
                    <span
                      className={`chat-status-dot ${value1?.isOnline ? "online" : "offline"}`}
                    />
                  </div>
                  <div>
                    <h6
                      style={{
                        color: `${TextColor}`,
                      }}
                      className="font-weight-bold mt-1 mb-0"
                    >
                      {value1.name}
                    </h6>
                    <p
                      className={`chat-status-text ${istyping ? "typing" : ""}`}
                      style={{ color: istyping ? "#0d6efd" : `${STextColor}` }}
                    >
                      {selectedUserStatusText}
                    </p>
                  </div>
                </button>
                <div className="chat-header-actions">
                  <button
                    type="button"
                    className="chat-home-link compact"
                    onClick={() => nav("/s")}
                  >
                    <i className="fa-solid fa-house" />
                    <span>Feed</span>
                  </button>
                  <button
                    type="button"
                    className="chat-close-btn"
                    onClick={() => setSelectChat(false)}
                  >
                    <i className="fa fa-window-close fs-4 chat-muted-icon" />
                  </button>
                </div>
              </div>

              <div
                style={{
                  backgroundImage: activeChatBackground,
                }}
                className="scroll2 overflow-auto mb-0 px-5 py-3"
              >
                {messages &&
                  messages.map((message, index) => {
                    const isOwnMessage =
                      toIdString(message.sender?._id || message.sender) === user1.id;
                    const mediaItems = getMessageMedia(message);
                    const viewOnceOpened =
                      !isOwnMessage && hasUserViewedMessage(message, user1.id);
                    const canDeleteForEveryone =
                      isOwnMessage && !message.deletedForEveryone;

                    return (
                      <div
                        className={`chat-bubble-row ${isOwnMessage ? "self" : ""}`}
                        key={message._id}
                      >
                        {!isOwnMessage ? (
                          <img
                            src={getAvatar(message.sender)}
                            alt={message.sender?.name || "Sender"}
                            className="chat-avatar"
                            onClick={() => openProfilePanel(message.sender)}
                          />
                        ) : null}

                        <div
                          className="chat-message-card"
                          style={{
                            marginLeft: isSameSenderMargin(
                              messages,
                              message,
                              index,
                              user1.id
                            ),
                            marginTop: isSameUser(messages, message, index, user1.id)
                              ? 3
                              : 10,
                            maxWidth: "75%",
                          }}
                        >
                          {mediaItems.length > 0 && !viewOnceOpened ? (
                            <div
                              className={`chat-media-grid ${mediaItems.length > 1 ? "multiple" : ""}`}
                            >
                              {mediaItems.map((mediaUrl, mediaIndex) => (
                                <button
                                  key={`${message._id}-${mediaIndex}`}
                                  type="button"
                                  className={`chat-media-thumb ${message.viewOnce ? "view-once" : ""}`}
                                  onClick={() =>
                                    handleOpenMessageMedia(message, mediaIndex)
                                  }
                                >
                                  <img
                                    src={mediaUrl}
                                    alt="shared"
                                    className="chat-image"
                                  />
                                  {message.viewOnce ? (
                                    <span className="view-once-chip">View once</span>
                                  ) : null}
                                </button>
                              ))}
                            </div>
                          ) : null}

                          {viewOnceOpened ? (
                            <div className="view-once-placeholder">
                              <span className="view-once-title">View once photo</span>
                              <span className="view-once-subtitle">Already opened</span>
                            </div>
                          ) : null}

                          {message.deletedForEveryone ? (
                            <div className="deleted-message-placeholder">
                              This message was deleted
                            </div>
                          ) : null}

                          {message.content && !message.deletedForEveryone ? (
                            <p
                              className="d-inline-block rounded"
                              style={{
                                color: `${TextColor}`,
                                backgroundColor: `${isOwnMessage ? fchatc : schatc}`,
                                borderRadius: "20px",
                                marginBottom: "0px",
                                padding: "5px 15px",
                              }}
                            >
                              {message.content}
                            </p>
                          ) : null}

                          <div
                            className={`chat-message-meta ${isOwnMessage ? "self" : ""}`}
                          >
                            <span className="chat-message-time">
                              {formatMessageTime(message.createdAt)}
                            </span>
                            <button
                              type="button"
                              className="chat-message-menu-btn"
                              onClick={(event) => openMessageMenu(event, {
                                ...message,
                                canDeleteForEveryone,
                              })}
                            >
                              <span className="chat-message-menu-dots">...</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {istyping ? (
                  <div
                    style={{ marginBottom: 15, marginLeft: 0 }}
                    className="d-flex justify-content-end mt-4"
                  >
                    <div className="circle me-1 circle1" />
                    <div className="circle me-1 circle2" />
                    <div className="circle me-1 circle3" />
                    <div className="circle me-1 circle4" />
                  </div>
                ) : null}

                <Menu
                  anchorEl={messageMenuAnchorEl}
                  open={messageMenuOpen}
                  onClose={closeMessageMenu}
                  TransitionComponent={Fade}
                >
                  <MenuItem
                    onClick={() =>
                      selectedMessageAction &&
                      handleDeleteForMe(selectedMessageAction._id)
                    }
                  >
                    Delete for me
                  </MenuItem>
                  {selectedMessageAction?.canDeleteForEveryone ? (
                    <MenuItem
                      onClick={() =>
                        handleDeleteForEveryone(selectedMessageAction._id)
                      }
                    >
                      Delete for everyone
                    </MenuItem>
                  ) : null}
                  {!selectedMessageAction?.canDeleteForEveryone &&
                  selectedMessageAction?.content ? (
                    <MenuItem onClick={handleModerateAndBlock}>
                      Analyze and block sender
                    </MenuItem>
                  ) : null}
                </Menu>

                <div ref={messagesEndRef} />
              </div>

              <div
                className="py-2 px-4"
                style={{
                  backgroundColor: `${ChatColor}`,
                  position: "relative",
                }}
              >
                {chatBlockedForMessaging ? (
                  <div className="chat-blocked-banner">
                    {isSelectedUserBlocked
                      ? "You blocked this user. Unblock from the profile panel to send messages."
                      : "This user has blocked you. Messaging is unavailable."}
                  </div>
                ) : null}
                {selectedMedia.length > 0 ? (
                  <div className="chat-selected-media-list mb-2">
                    {selectedMedia.map((item) => (
                      <div key={item.id} className="chat-selected-media">
                        <img src={item.preview} alt="Selected to send" />
                        <button
                          type="button"
                          className="chat-selected-media-remove"
                          onClick={() => removeSelectedMedia(item.id)}
                          aria-label="Remove selected image"
                          title="Remove selected image"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                {selectedMedia.length > 0 ? (
                  <div className="chat-media-toolbar mb-2">
                    <button
                      type="button"
                      className={`view-once-toggle ${viewOnceEnabled ? "active" : ""}`}
                      onClick={() => setViewOnceEnabled((currentValue) => !currentValue)}
                    >
                      {viewOnceEnabled ? "View once on" : "View once off"}
                    </button>
                    <span className="small chat-muted-copy">
                      {selectedMedia.length} photo
                      {selectedMedia.length > 1 ? "s" : ""} selected
                    </span>
                  </div>
                ) : null}

                <div className="d-flex align-items-center justify-content-center position-relative">
                {showEmojiPicker ? (
                  <div className="emoji-picker">
                    <div className="emoji-grid">
                      {EMOJI_GROUPS.map((group) => (
                        <div className="emoji-section" key={group.label}>
                          <p className="emoji-section-title">{group.label}</p>
                          <div className="d-flex flex-wrap gap-1">
                            {group.items.map((emoji) => (
                              <button
                                key={`${group.label}-${emoji}`}
                                type="button"
                                className="emoji-btn"
                                onClick={() => appendEmoji(emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  className="border-0 bg-transparent p-0 emoji-trigger"
                  title="Open emoji picker"
                  aria-label="Open emoji picker"
                  onClick={() => setShowEmojiPicker((currentValue) => !currentValue)}
                >
                  <i className="fa-regular fa-face-laugh-beam fs-4 me-3 chat-muted-icon" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="d-none"
                  onChange={handleImageSelection}
                />
                <button
                  type="button"
                  className="border-0 bg-transparent p-0 upload-trigger"
                  title="Send photo"
                  aria-label="Send photo"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!chat?._id || imageUploading || chatBlockedForMessaging}
                >
                  <i className="fa-solid fa-paperclip fs-4 me-3 chat-muted-icon" />
                </button>

                <input
                  className="form-control grey p-2 chat-input-field"
                  style={{
                    backgroundColor: `${Color4}`,
                    color: `${TextColor}`,
                  }}
                  value={newMessage}
                  onChange={typingHandler}
                  type="text"
                  placeholder="type a message"
                  aria-label="First name"
                  onKeyDown={handleKeyDown}
                  disabled={chatBlockedForMessaging}
                />

                {imageUploading ? (
                  <span className="me-2 chat-muted-copy small">Uploading...</span>
                ) : null}

                <i
                  onClick={() => PostMessage()}
                  aria-hidden="true"
                  className="fa fa-paper-plane bg-primary green px-4 py-2 ms-3 rounded"
                />
                </div>
              </div>

              {showProfilePanel && selectedProfile ? (
                <div className="chat-profile-panel">
                  <button
                    type="button"
                    className="chat-profile-close"
                    onClick={() => setShowProfilePanel(false)}
                  >
                    x
                  </button>
                  <img
                    src={selectedProfile.image || DEFAULT_AVATAR}
                    alt={selectedProfile.name}
                    className="chat-profile-image"
                  />
                  <h4 className="mb-1">{selectedProfile.name}</h4>
                  <p className="chat-profile-about">
                    {selectedProfile.about || "No caption or bio added yet."}
                  </p>
                  <div className="chat-profile-stats">
                    <div>
                      <strong>{selectedProfile.followers?.length || 0}</strong>
                      <span>Followers</span>
                    </div>
                    <div>
                      <strong>{selectedProfile.following?.length || 0}</strong>
                      <span>Following</span>
                    </div>
                  </div>
                  <div className="chat-profile-actions-list">
                    <button
                      type="button"
                      className="chat-profile-btn"
                      onClick={() => nav("/user/" + selectedProfile._id)}
                    >
                      Open full profile
                    </button>
                    <button
                      type="button"
                      className="chat-profile-btn"
                      onClick={handleToggleBlockUser}
                    >
                      {isSelectedUserBlocked ? "Unblock user" : "Block user"}
                    </button>
                    <button
                      type="button"
                      className="chat-profile-btn"
                      onClick={handleArchiveCurrentChat}
                    >
                      {chat?.archivedForCurrentUser ? "Unarchive chat" : "Archive chat"}
                    </button>
                    <button
                      type="button"
                      className="chat-profile-btn"
                      onClick={handleSetChatPassword}
                    >
                      Set chat password
                    </button>
                    {chat?.passwordProtected ? (
                      <button
                        type="button"
                        className="chat-profile-btn danger"
                        onClick={handleRemoveChatPassword}
                      >
                        Remove chat password
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div
              className="scroll2 col-8 h-100 p-0 bg-black chat-content-pane chat-empty-pane"
              style={{
                backgroundImage: emptyChatBackground,
              }}
            >
              {!loading1 ? (
                <h1 className="f align-center" style={{ color: TextColor }}>
                  {user1.name}, pick a conversation from ROHAINA
                </h1>
              ) : (
                <GridLoader className="f align-center" color="#3667d6" />
              )}
            </div>
          )}
        </section>
      </div>

      {mediaViewer.open ? (
        <div className="chat-media-viewer" onClick={closeMediaViewer}>
          <button
            type="button"
            className="chat-media-viewer-close"
            onClick={closeMediaViewer}
          >
            x
          </button>

          {mediaViewer.images.length > 1 ? (
            <button
              type="button"
              className="chat-media-viewer-nav prev"
              onClick={(event) => {
                event.stopPropagation();
                setMediaViewer((currentViewer) => ({
                  ...currentViewer,
                  index:
                    currentViewer.index === 0
                      ? currentViewer.images.length - 1
                      : currentViewer.index - 1,
                }));
              }}
            >
              {"<"}
            </button>
          ) : null}

          <div
            className="chat-media-viewer-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={mediaViewer.images[mediaViewer.index]}
              alt={mediaViewer.title}
              className="chat-media-viewer-image"
            />
            <div className="chat-media-viewer-footer">
              <span>
                {mediaViewer.title}
                {mediaViewer.images.length > 1
                  ? ` (${mediaViewer.index + 1}/${mediaViewer.images.length})`
                  : ""}
              </span>
              {mediaViewer.viewOnce ? (
                <span className="view-once-toggle active">View once</span>
              ) : null}
            </div>
          </div>

          {mediaViewer.images.length > 1 ? (
            <button
              type="button"
              className="chat-media-viewer-nav next"
              onClick={(event) => {
                event.stopPropagation();
                setMediaViewer((currentViewer) => ({
                  ...currentViewer,
                  index:
                    currentViewer.index === currentViewer.images.length - 1
                      ? 0
                      : currentViewer.index + 1,
                }));
              }}
            >
              {">"}
            </button>
          ) : null}
        </div>
      ) : null}

      <div />
    </div>
  );
};

export default Join;
