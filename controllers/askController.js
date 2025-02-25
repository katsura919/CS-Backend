const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/chatModel");
const Process = require("../models/processModel"); // Use Mongoose model
const generateEmbedding = require("../utils/generateEmbedding"); // Updated embedding function

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.askAI = async (req, res) => {
  try {
    const { query, history } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    // Step 1: Convert user query to an embedding using the new function
    const queryEmbedding = await generateEmbedding(query);
    console.log("Query Embedded:  ", queryEmbedding)
    if (!queryEmbedding) return res.status(500).json({ error: "Failed to generate query embedding." });

    // Step 2: Perform MongoDB Vector Search to find relevant school processes (Using Mongoose)
    const processResults = await Process.aggregate([
      {
        $vectorSearch: {
          index: "vector_search", // Your Atlas Search index name
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 10,
          limit: 2, // Return top 5 most relevant processes
          similarity: "cosine"
        }
      }
    ]);

    // Step 3: Format relevant process information
    const processContext = processResults
      .map(p => `${p.title}: ${p.steps.join(", ")}`)
      .join("\n");
    console.log("Data pulled up: ", processContext)

    // Step 4: Construct AI Prompt with History
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

    const formattedHistory = history
      ?.map((msg) => `**${msg.role === "user" ? "User" : "AI"}:** ${msg.content}`)
      .join("\n") || "";

    const prompt = `
      You are Codey, a friendly and supportive virtual assistant from the USTP IT Faculty. 
      You specialize in helping users with school-related questions.

      **Guidelines:**
      1. **For school-related processes:** Provide step-by-step guides with numbered lists.
      2. **If the question is not school-related:** Politely redirect the user to school-related topics.
      3. **Always match the language of the user's query.**

      **Relevant School Processes:** 
      ${processContext}

      **Chat History:** 
      ${formattedHistory}

      **User's Question:** 
      ${query}
    `;

    // Step 5: Generate AI Response
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Step 6: Save chat history
    const chat = new Chat({ query, response: responseText });
    await chat.save();

    res.json({ answer: responseText, id: chat._id });
  } catch (error) {
    console.error("Error querying Gemini AI:", error);
    res.status(500).json({ error: "An error occurred while processing your request" });
  }
};
