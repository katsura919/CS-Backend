require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");

//Routes
const processRoutes = require('./routes/processRoutes');
const askRoutes = require("./routes/askRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes= require("./routes/analyticsRoutes");
const app = express();
app.use(express.json());

// ✅ Middleware (CORS & JSON Parsing)
app.use(cors({
    origin: function (origin, callback) {
      // Allow both localhost and the deployed frontend
      const allowedOrigins = ['http://localhost:3000', 'https://admin-codey.vercel.app/'];
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error('CORS policy violation')); // Reject the request
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));

// Connect to MongoDB
mongoose.connect(`mongodb+srv://katsuragik919:gUxW6bdC56s2bgQE@csbackend.frzm8.mongodb.net/?retryWrites=true&w=majority&appName=CSBackend`)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use Routes
app.use('/api/processes', processRoutes);
app.use("/api/ask", askRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});