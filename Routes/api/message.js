const express = require("express");


const router = express.Router();
const auth =require("../../middleware/auth")
const allMessage = require ("../../Controllers/chat/allMessage")
const sendMessage = require("../../Controllers/chat/sendMessage")
const markViewOnce = require("../../Controllers/chat/markViewOnce")
const markChatRead = require("../../Controllers/chat/markChatRead")
const deleteMessageForEveryone = require("../../Controllers/chat/deleteMessageForEveryone")
const deleteMessageForMe = require("../../Controllers/chat/deleteMessageForMe")
router.route("/read/:chatId").put(auth, markChatRead);
router.route("/view-once/:messageId").put(auth, markViewOnce);
router.route("/everyone/:messageId").delete(auth, deleteMessageForEveryone);
router.route("/:messageId/everyone").delete(auth, deleteMessageForEveryone);
router.route("/me/:messageId").delete(auth, deleteMessageForMe);
router.route("/:messageId/me").delete(auth, deleteMessageForMe);
router.route("/").post(auth, sendMessage);
router.route("/:chatId").get(auth, allMessage);


module.exports=router
