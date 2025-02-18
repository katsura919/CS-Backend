const express = require("express");
const { deleteChat, getChats, updateChatStatus} = require("../controllers/chatController"); // Import the controller function

const router = express.Router();

// Route to delete a chat by its ID
router.delete("/delete/:chatId", deleteChat); // Changed /delete/:chatId to /chats/:chatId for consistency
router.get("/chats", getChats); 
router.put("/update-chat-status/:chatId", updateChatStatus);


module.exports = router;
