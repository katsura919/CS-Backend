const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/chatModel");
const FAQ = require("../models/faqModel");
const Tenant = require("../models/tenantModel");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// Helper function to fetch FAQs by slug
const fetchFAQsBySlug = async (slug) => {
  try {
      const tenant = await Tenant.findOne({ slug });
      if (!tenant) {
          return { faqs: null, tenantId: null }; // Return null for both if tenant not found
      }
      const faqs = await FAQ.find({ tenantId: tenant._id })
          .sort({ createdAt: -1 })
          .select('_id question answer');
      return { faqs, tenantId: tenant._id }; // Return both FAQs and tenantId
  } catch (error) {
      console.error('Error fetching FAQs:', error);
      return { faqs: null, tenantId: null }; // Return null for both on error
  }
};

// Enhanced prompt construction
const constructPrompt = ({ query, faqs, history }) => `
You are Codey, a friendly and supportive virtual assistant.
You specialize in anwering user questions.

**Guidelines:**
1. Maintain professional but friendly tone
2. Use structured responses with bullet points
3. Match user's language preference
4. Be concise but thorough
5. Redirect non-school topics politely

${faqs ? "**Relevant FAQs:**\n" + 
    faqs.map(faq => `${faq.question}: ${faq.answer}`).join("\n") + "\n" : ""}

${history ? "**Previous Conversation Context:**\n" + 
    history.map(msg => `**${msg.role === "user" ? "User" : "AI"}:** ${msg.content}`).join("\n") + "\n" : ""}

**Current Question:**
${query}

Please respond with a helpful, structured answer.
**Important Instructions:**
1. Only answer based on the provided FAQ information
2. If the question isn't covered in the FAQs, politely tell the user
3. Do not make assumptions or provide information not found in the FAQs
4. Structure your response using bullet points if needed
5. Keep answers focused and relevant to the provided information

Please provide a response based only on the FAQ information above.`;

// Main route handler (Rate limiter removed)
exports.askAI = async (req, res) => {
  try {
      const { query, history } = req.body;  // Added history parameter
      const slug = req.params.slug;

      // Input validation
      if (!query || typeof query !== 'string') {
          return res.status(400).json({ 
              error: "Query must be a non-empty string" 
          });
      }

      // Fetch FAQs and tenantId if slug is provided
      const { faqs, tenantId } = slug ? await fetchFAQsBySlug(slug) : { faqs: null, tenantId: null };

      // Construct AI Prompt with History and FAQs
      const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-pro-exp-02-05" 
      });

      // Generate AI Response
      const result = await model.generateContent(
          constructPrompt({ query, faqs, history })
      );
      const responseText = result.response.text();

      // Save individual query and response to chatModel
      const chat = new Chat({ 
          query, 
          response: responseText,
          tenantId // Include tenantId here
      });
      await chat.save();

      res.json({
          answer: responseText,
          id: chat._id,
          faqs: faqs || []
      });
  } catch (error) {
      console.error("Error querying Gemini AI:", error);
      res.status(500).json({ 
          error: "An error occurred while processing your request" 
      });
  }
};