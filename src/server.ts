import express from "express";
import cors from "cors";
import path from "path";
import { startBot, getBotStatus } from "./bot/botManager";

export function startServer(port: number) {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  // Render'da dist içine derlendiğinde public klasörünü bulabilmesi için process.cwd() kullanıyoruz
  app.use(express.static(path.join(process.cwd(), "public")));

  app.post("/api/connect", (req, res) => {
    const { ip, port, username } = req.body;
    startBot(ip, port, username);
    res.json({ success: true, message: "Bot sunucuya giriş komutu aldı." });
  });

  app.get("/api/status", (req, res) => {
    res.json(getBotStatus());
  });

  app.listen(port, () => {
    console.log(`🚀 Web Kontrol Paneli Yayında! Port: ${port}`);
  });
}
