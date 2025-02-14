const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/chatModel");
const Process = require("../models/processModel");
const Announcement = require("../models/announcementModel");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// Helper function to retrieve relevant context
const retrieveContext = async () => {
  // Fetch school processes
  const processes = await Process.find();
  const processContext = processes.map(p => `${p.title}: ${p.steps.join(", ")}`).join("\n");

  // Fetch latest announcements (limit to the most recent 5)
  const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(5);
  const announcementContext = announcements.map(a => `📢 ${a.title}: ${a.details}`).join("\n");

  return `
    ### **School Processes You Know:**  
    ${processContext}

    ### **Latest Announcements:**  
    ${announcementContext}
  `;
};

exports.askAI = async (req, res) => {
  try {
    const { query, history } = req.body; // Accepts history separately
    if (!query) return res.status(400).json({ error: "Query is required" });

    // Step 1: Retrieve relevant context
    const context = await retrieveContext();
    
    // Step 2: Construct AI Prompt with History
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const formattedHistory = history
      ?.map((msg) => `**${msg.role === "user" ? "User" : "AI"}:** ${msg.content}`)
      .join("\n") || ""; // Convert history to readable format
   
    const prompt = `
    You are Codey, a friendly and supportive virtual assistant from the USTP IT Faculty. You specialize in helping users with school-related questions.

    **Guidelines:**
    1. **For school-related processes:** Provide step-by-step guides with numbered lists.
    2. **For sensitive topics:** Respond with empathy and concise guidance.
    3. **If the question is not school-related:** Politely redirect the user to school-related topics.
    4. **Keep responses concise, clear, and engaging.**
    5. **Always ask if the user needs anything else if necessary and match the language that the user is currently using:** 
    6. **Always Match the language of the user's query. If the user asks in English, respond in English. If the user asks in another language, respond in that language while maintaining clarity and accuracy.**

    **Contextual Information:**
    ${context}

    **Chat History:**
    ${formattedHistory}

    **User's Question:**
    ${query}
    `;

    // Step 3: Generate AI Response
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Step 4: Save only the latest query-response in MongoDB
    const chat = new Chat({ query, response: responseText });
    await chat.save();

    // Step 5: Return AI Response
    res.json({ answer: responseText, id: chat._id });
  } catch (error) {
    console.error("Error querying Gemini AI:", error);
    res.status(500).json({ error: "An error occurred while processing your request" });
  }
};

