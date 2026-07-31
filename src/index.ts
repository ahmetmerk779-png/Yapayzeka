import dotenv from "dotenv";
dotenv.config();

import { startWebPanelServer } from "./server";
import { MemoryManager } from "./ai/memory";

async function bootstrap() {
  console.log("🚀 Groq AI Minecraft Bot Servisi Başlatılıyor...");

  const port = parseInt(process.env.PORT || "3000");
  const memory = new MemoryManager();

  // Yalnızca Web Paneli Başlatılır (Bot panelden tetiklenir)
  startWebPanelServer(memory, port);

  process.on("unhandledRejection", (reason) => {
    console.error("İşlenmeyen Promise Reddi:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("Yakalanamayan İstisna:", error);
  });
}

bootstrap();
