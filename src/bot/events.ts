import { Bot } from "mineflayer";
import { MemoryManager } from "../ai/memory";
import { BotActions } from "./actions";
import { processAiDecision } from "../ai/groq";

export function setupBotEvents(bot: Bot, actions: BotActions, memory: MemoryManager): void {
  bot.on("spawn", () => {
    console.log(`[+] ${bot.username} oyuna katıldı.`);
    memory.addEvent("Bot dünyaya başarılı bir şekilde giriş yaptı.");
  });

  bot.on("chat", async (username, message) => {
    if (username === bot.username) return;

    memory.addChatMessage(username, message);

    if (message.toLowerCase().includes(bot.username.toLowerCase())) {
      const userPrompt = `${username}: ${message}`;
      
      const aiResponse = await processAiDecision(bot, memory, userPrompt);
      if (!aiResponse) return;

      const commandRegex = /\[(.*?)\]/;
      const match = aiResponse.match(commandRegex);
      
      const cleanMessage = aiResponse.replace(commandRegex, "").trim();
      if (cleanMessage) {
        await actions.speak(cleanMessage);
      }

      if (match) {
        const fullCommand = match[1]; 
        const [action, target] = fullCommand.split(":");

        switch (action.toUpperCase()) {
          case "GOTO":
            await actions.gotoPlayer(target);
            break;
          case "KAZ":
            await actions.digBlock(target);
            break;
          case "DUR":
            await actions.stop();
            break;
        }
      }
    }
  });

  bot.on("kicked", (reason) => {
    console.log("Atılma nedeni:", reason);
    memory.addEvent(`Sunucudan atıldı: ${reason}`);
  });

  bot.on("error", (err) => console.error("Bot hatası:", err));
}
