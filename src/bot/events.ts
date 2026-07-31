import { Bot } from "mineflayer";
import { MemoryManager } from "../ai/memory";
import { BotActions } from "./actions";
import { processAiDecision } from "../ai/groq";

export function setupBotEvents(bot: Bot, actions: BotActions, memory: MemoryManager): void {
  bot.on("spawn", () => {
    console.log("Bot oyuna katıldı.");
    memory.addEvent("Bot sunucuya giriş yaptı.");
  });

  bot.on("chat", async (username, message) => {
    if (username === bot.username) return;

    memory.addChatMessage(username, message);

    if (message.includes(bot.username)) {
      const userPrompt = `${username} sana dedi ki: ${message}`;
      await processAiDecision(bot, actions, memory, userPrompt);
    }
  });

  bot.on("kicked", (reason) => {
    console.log("Bot sunucudan atıldı:", reason);
    memory.addEvent(`Sunucudan atıldı: ${reason}`);
  });

  bot.on("error", (err) => {
    console.error("Bot hatası:", err);
  });
}
