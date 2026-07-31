import mineflayer, { Bot } from "mineflayer";
import { pathfinder } from "mineflayer-pathfinder";
import { BotActions } from "./actions";
import { MemoryManager } from "../ai/memory";
import { setupBotEvents } from "./events";
import { BotConfig } from "../types";

let currentBot: Bot | null = null;
let currentActions: BotActions | null = null;
let botStatus: "offline" | "connecting" | "online" = "offline";
let lastLog: string = "Bot başlatılmadı.";

export function getBotStatus() {
  return {
    status: botStatus,
    log: lastLog,
    username: currentBot?.username || null,
    health: currentBot?.health || 0,
    food: currentBot?.food || 0,
    pos: currentBot?.entity?.position ? {
      x: Math.round(currentBot.entity.position.x),
      y: Math.round(currentBot.entity.position.y),
      z: Math.round(currentBot.entity.position.z),
    } : null
  };
}

export function connectMinecraftBot(config: BotConfig, memory: MemoryManager): { success: boolean; message: string } {
  if (currentBot) {
    return { success: false, message: "Bot zaten çalışıyor!" };
  }

  try {
    botStatus = "connecting";
    lastLog = `${config.host}:${config.port} adresine bağlanılıyor...`;

    const botOptions: any = {
      host: config.host,
      port: config.port,
      username: config.username || "Groq_AI_Bot",
      auth: config.auth || "offline",
    };

    if (config.version && config.version.trim() !== "") {
      botOptions.version = config.version;
    }

    currentBot = mineflayer.createBot(botOptions);
    currentBot.loadPlugin(pathfinder);

    currentActions = new BotActions(currentBot);
    setupBotEvents(currentBot, currentActions, memory);

    currentBot.on("spawn", () => {
      botStatus = "online";
      lastLog = `✅ ${currentBot?.username} oyuna başarıyla katıldı!`;
    });

    currentBot.on("end", (reason) => {
      botStatus = "offline";
      lastLog = `❌ Bağlantı kesildi: ${reason}`;
      currentBot = null;
      currentActions = null;
    });

    currentBot.on("error", (err) => {
      botStatus = "offline";
      lastLog = `⚠️ Hata: ${err.message}`;
    });

    return { success: true, message: "Bağlantı isteği gönderildi." };
  } catch (error: any) {
    botStatus = "offline";
    lastLog = `Bağlantı hatası: ${error.message}`;
    return { success: false, message: error.message };
  }
}

export function disconnectMinecraftBot(): { success: boolean; message: string } {
  if (!currentBot) {
    return { success: false, message: "Zaten bağlı olan bir bot yok." };
  }

  currentBot.quit("Panel üzerinden kapatıldı.");
  currentBot = null;
  currentActions = null;
  botStatus = "offline";
  lastLog = "Bot kullanıcı tarafından kapatıldı.";

  return { success: true, message: "Bot bağlantısı kesildi." };
                   }
