require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

(async () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "What is the main problem with flotation process?";

  try {
    const result = await model.generateContent(prompt);
    // Adjust the extraction to match the actual returned structure:
    // e.g., result.response.candidates[0].content or result.parts[0].text
    // This is an example assuming 'result.response.candidates' is valid:
    console.log(result?.response?.candidates?.[0]?.content || "No response");
  } catch (err) {
    console.error("Gemini API Error:", err);
  }
})();
