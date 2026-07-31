import express from "express";
import cors from "cors";
import path from "path";
import { startBot, getBotStatus } from "./bot/botManager";

export function startServer(port: number) {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), "public")));

  app.post("/api/connect", (req, res) => {
    const { ip, port, username } = req.body;
    startBot(ip, port, username);
    res.json({ success: true, message: "Bot sunucuya bağlantı başlattı." });
  });

  app.get("/api/status", (req, res) => {
    res.json(getBotStatus());
  });

  app.listen(port, () => {
    console.log(`🚀 Kontrol Paneli Aktif: Port ${port}`);
  });
}
