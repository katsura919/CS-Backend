// controllers/chatController.js
const Chat = require("../models/chatModel");

exports.getChatResponseStats = async (req, res) => {
  try {
    const totalResponses = await Chat.countDocuments({ isGoodResponse: { $ne: null } });
    const goodResponses = await Chat.countDocuments({ isGoodResponse: true });
    const badResponses = await Chat.countDocuments({ isGoodResponse: false });

    if (totalResponses === 0) {
      return res.json({
        message: "No responses available",
        goodPercentage: 0,
        badPercentage: 0,
      });
    }

    const goodPercentage = ((goodResponses / totalResponses) * 100).toFixed(2);
    const badPercentage = ((badResponses / totalResponses) * 100).toFixed(2);

    res.json({
      totalResponses,
      goodResponses,
      badResponses,
      goodPercentage: `${goodPercentage}%`,
      badPercentage: `${badPercentage}%`,
    });
  } catch (error) {
    console.error("Error calculating response stats:", error);
    res.status(500).json({ error: "An error occurred while calculating stats" });
  }
};