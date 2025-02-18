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


exports.getResponseCounts = async (req, res) => {
  try {
    const { range } = req.query; // Get range from query parameters
    let daysAgo = 30; // Default to 30 days

    // Set days based on range
    if (range === "7d") daysAgo = 7;
    else if (range === "90d") daysAgo = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo); // Set to X days ago

    // Aggregation pipeline
    const responseCounts = await Chat.aggregate([
      { $match: { createdAt: { $gte: startDate } } }, // Filter by date range
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Format as YYYY-MM-DD
            isGoodResponse: "$isGoodResponse",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize chart data for the given time range
    const chartData = [];
    const today = new Date();

    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD

      chartData.push({
        date: formattedDate,
        good: 0,
        bad: 0,
      });
    }

    // Map aggregation results into chartData
    responseCounts.forEach((item) => {
      const chartIndex = chartData.findIndex((data) => data.date === item._id.date);

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

