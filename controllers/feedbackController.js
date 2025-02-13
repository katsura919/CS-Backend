const Chat = require("../models/chatModel");

exports.feedbackAI = async (req, res) => {
    try {
      console.log("Received feedback request:", req.body);
  
      const { chatId, action } = req.body;
      if (!chatId || !["like", "dislike"].includes(action)) {
        return res.status(400).json({ error: "Invalid request" });
      }
  
      const update = { isGoodResponse: action === "like" };
      const chat = await Chat.findByIdAndUpdate(chatId, update, { new: true });
  
      if (!chat) {
        console.log("Chat not found:", chatId);
        return res.status(404).json({ error: "Chat not found" });
      }
  
      res.json({ message: "Feedback updated successfully", chat });
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  };
  