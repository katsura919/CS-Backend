const Chat = require("../models/chatModel"); // Import the Chat model

// Controller to delete a chat by its ID
const deleteChat = async (req, res) => {
  const { chatId } = req.params; // Get the chatId from the URL parameters

  try {
    // Find and delete the chat
    const deletedChat = await Chat.findByIdAndDelete(chatId);

    if (!deletedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({ message: "Chat deleted successfully", chat: deletedChat });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "An error occurred while deleting the chat", details: error.message });
  }
};

// 📌 Fetch all chats (latest first)
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 }); // Ensure `createdAt` exists in your schema
    res.status(200).json(chats); // Return status 200 for successful fetch
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "An error occurred while fetching chats", details: error.message });
  }
};

// Controller function to update the chat status
const updateChatStatus = async (req, res) => {
    const { chatId } = req.params;
    const { action } = req.body;
  
    // Validate the action input
    if (!action || !["like", "dislike", "none"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Valid actions are 'like', 'dislike', or 'none'." });
    }
  
    try {
      // Determine the value for isGoodResponse based on the action
      let isGoodResponse = null;
      if (action === "like") {
        isGoodResponse = true;
      } else if (action === "dislike") {
        isGoodResponse = false;
      } else if (action === "none") {
        isGoodResponse = null;
      }
  
      // Find the chat by ID and update the isGoodResponse field
      const chat = await Chat.findByIdAndUpdate(
        chatId,
        { isGoodResponse: isGoodResponse },
        { new: true } // Return the updated chat document
      );
  
      // If chat not found, return an error
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
  
      // Return the updated chat data
      res.json({ message: "Chat status updated successfully", chat });
    } catch (error) {
      console.error("Error updating chat status:", error);
      res.status(500).json({ error: "An error occurred while updating chat status" });
    }
  };

  
module.exports = { deleteChat, getChats, updateChatStatus };
