require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");

//Routes
const faqRoutes = require('./routes/faqRoutes');
const askRoutes = require("./routes/askRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes= require("./routes/analyticsRoutes");
const chatRoutes = require("./routes/chatRoutes");
const knowledgeRoutes = require("./routes/knowledgeRoutes");

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  "https://admin-codey.vercel.app",
];

// ✅ Allow CORS for frontend
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  })
);

// Connect to MongoDB
mongoose.connect(`mongodb+srv://katsuragik919:gUxW6bdC56s2bgQE@csbackend.frzm8.mongodb.net/?retryWrites=true&w=majority&appName=CSBackend`)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use Routes
app.use("/auth", authRoutes);
app.use("/knowledge", knowledgeRoutes);
// app.use('/api/faqs', faqRoutes);
app.use("/ask", askRoutes);
// app.use("/api/feedback", feedbackRoutes);
// app.use("/api/analytics", analyticsRoutes);
// app.use("/api/chat", chatRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});