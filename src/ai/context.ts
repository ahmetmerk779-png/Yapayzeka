import { Bot } from "mineflayer";
import { MemoryManager } from "./memory";

export function generateSystemContext(bot: Bot, memory: MemoryManager): string {
  if (!bot || !bot.entity) return "Bot henüz oyuna yüklenmedi.";
  const pos = bot.entity.position;
  return `Sen Minecraft dünyasındaki AI ajansın. Adın: ${bot.username}
Can: ${bot.health}/20 | Konum: X:${Math.round(pos.x)} Y:${Math.round(pos.y)} Z:${Math.round(pos.z)}
Sohbet Geçmişi:\n${memory.getFormattedChatHistory()}`;
}
