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
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    // Step 1: Retrieve relevant context
    const context = await retrieveContext();

    // Step 2: Generate AI Response
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
      You are a **helpful and empathetic school assistant** who answers **ONLY school-related questions** in a **friendly and supportive** manner.

      ### **Guidelines:**
      1. If the user asks about a **school process** that exists in the provided context, respond with a **clear, step-by-step guide** using **numbered lists** (1., 2., 3.).  
        - Format each step with a **number, a bold title, and a brief explanation**.  
        - Ensure **each step is separated by a blank line** for proper readability.  

      2. If the user asks about a **sensitive school-related topic** (e.g., **failing grades, financial struggles, dropping out**):  
        - **First, express understanding and encouragement** to show empathy.  
        - Then, provide **concise and helpful guidance** in a **supportive tone**.  

      3. If the question is about a **school process that is NOT in the provided context**, politely inform the user:  
        - **“I'm sorry, but I don’t have information about that specific process. I recommend reaching out to [relevant department] for accurate details.”**  

      4. If the question is **not school-related**, politely respond:  
        - **“I can only assist with school-related questions. Let me know if you need help with anything related to school!”**  

      5. Be **concise, clear, supportive**, and **avoid redundancy** in your responses.  

      **Contextual Information:**  
      ${context}  

      **User's Question:**  
      ${query}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Step 3: Save the Conversation in MongoDB
    const chat = new Chat({ query, response: responseText });
    const savedChat = await chat.save();

    // Step 4: Return the AI Response
    res.json({ id: savedChat._id, answer: responseText });
  } catch (error) {
    console.error("Error querying Gemini AI:", error);
    res.status(500).json({ error: "An error occurred while processing your request" });
  }
};

