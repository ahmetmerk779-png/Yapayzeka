import Groq from "groq-sdk";
import { Bot } from "mineflayer";
import { BotActions } from "../bot/actions";
import { generateSystemContext } from "./context";
import { MemoryManager } from "./memory";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function processAiDecision(bot: Bot, actions: BotActions, memory: MemoryManager, userPrompt: string): Promise<void> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: generateSystemContext(bot, memory) },
        { role: "user", content: userPrompt }
      ]
    });
    const msg = response.choices[0]?.message?.content;
    if (msg) await actions.speak(msg);
  } catch (e) {
    console.error("Groq hatası:", e);
  }
}
