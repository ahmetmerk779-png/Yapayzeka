import { createBot, Bot } from "mineflayer";
import { pathfinder } from "mineflayer-pathfinder";
import { setupBotEvents } from "./events";
import { BotActions } from "./actions";
import { MemoryManager } from "../ai/memory";

let activeBot: Bot | null = null;
let currentServerInfo = "";

export function startBot(host: string, port: number, username: string) {
  if (activeBot) {
    activeBot.quit();
  }

  currentServerInfo = `${host}:${port}`;
  
  activeBot = createBot({
    host: host,
    port: port,
    username: username,
    version: "1.21.11" // Sürüm sabitlendi
  });

  activeBot.loadPlugin(pathfinder);

  const memory = new MemoryManager();
  const actions = new BotActions(activeBot);

  setupBotEvents(activeBot, actions, memory);
}

export function getBotStatus() {
  if (!activeBot || !activeBot.entity) {
    return { online: false };
  }

  const pos = activeBot.entity.position;
  return {
    online: true,
    server: currentServerInfo,
    health: Math.round(activeBot.health),
    food: Math.round(activeBot.food),
    position: {
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      z: Math.round(pos.z)
    }
  };
}
