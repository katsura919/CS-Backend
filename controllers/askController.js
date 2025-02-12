const { GoogleGenerativeAI } = require("@google/generative-ai");
const Process = require("../models/processModel"); // Assuming Process model is defined

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.askAI = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Fetch processes from the database
    const processes = await Process.find();
    const context = processes
      .map(p => `${p.title}: ${p.steps.join(", ")}`)
      .join("\n");

    // Define AI persona and restriction to school-related topics
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

---

### **School Processes You Know:**
${context}

### **User's Question:**  
${query}

`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("AI Response:", responseText); // Debugging log

    res.json({ answer: responseText });
  } catch (error) {
    console.error("Error querying Gemini AI:", error);
    res.status(500).json({ error: "An error occurred while processing your request" });
  }
};
