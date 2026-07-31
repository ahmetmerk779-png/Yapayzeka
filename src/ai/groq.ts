import Groq from "groq-sdk";
import { Bot } from "mineflayer";
import { generateSystemContext } from "./context";
import { MemoryManager } from "./memory";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function processAiDecision(bot: Bot, memory: MemoryManager, userPrompt: string): Promise<string | null> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: generateSystemContext(bot, memory) },
        { role: "user", content: userPrompt }
      ]
    });
    return response.choices[0]?.message?.content || null;
  } catch (e) {
    console.error("Groq API Hatası:", e);
    return null;
  }
}
