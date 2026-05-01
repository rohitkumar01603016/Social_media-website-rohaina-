const express = require("express");
const router = express.Router();
const auth =require("../../middleware/auth")
const accessChat = require ("../../Controllers/chat/accessChat")
const fetchChats = require("../../Controllers/chat/fetchChat")
const {
  toggleArchiveChat,
  setChatPassword,
  removeChatPassword,
  unlockChat,
} = require("../../Controllers/chat/chatSettings")
router.route("/").post(auth,accessChat);
router.route("/").get(auth,fetchChats);
router.route("/:chatId/archive").put(auth, toggleArchiveChat);
router.route("/:chatId/password").put(auth, setChatPassword).delete(auth, removeChatPassword);
router.route("/:chatId/unlock").post(auth, unlockChat);


module.exports=router
