import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiAPIResponse = async (message) => {
  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(message);

    const reply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    return reply;
  } catch (err) {
    console.error("gemini error:", err);
    return null;
  }
};

export default getGeminiAPIResponse;
