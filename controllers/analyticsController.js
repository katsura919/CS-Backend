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

// Get response counts for the past 3 months
exports.getResponseCounts = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Aggregation pipeline
    const responseCounts = await Chat.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } }, // Filter last 6 months
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" }, // Extract month number
            isGoodResponse: "$isGoodResponse",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the data into { month: "January", good: X, bad: Y }
    const chartData = [];

    // Get current month index (1 = Jan, 2 = Feb, etc.)
    const currentMonth = new Date().getMonth() + 1; // JS months are 0-based
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Initialize past 6 months data with 0 counts
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 11) % 12; // Ensure it wraps around
      chartData.push({
        month: monthNames[monthIndex],
        good: 0,
        bad: 0,
      });
    }

    // Map aggregation results into chartData
    responseCounts.forEach((item) => {
      const monthIndex = item._id.month - 1; // Convert MongoDB's month number (1-12) to array index
      const chartIndex = chartData.findIndex((data) => data.month === monthNames[monthIndex]);

      if (chartIndex !== -1) {
        if (item._id.isGoodResponse === true) {
          chartData[chartIndex].good = item.count;
        } else if (item._id.isGoodResponse === false) {
          chartData[chartIndex].bad = item.count;
        }
      }
    });

    res.json(chartData);
  } catch (error) {
    console.error("Error fetching response counts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
