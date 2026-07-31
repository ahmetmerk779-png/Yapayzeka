import express from "express";
import { connectMinecraftBot, disconnectMinecraftBot, getBotStatus } from "./bot/botManager";
import { MemoryManager } from "./ai/memory";

export function startWebPanelServer(memory: MemoryManager, port: number = 3000): void {
  const app = express();
  app.use(express.json());

  // API Endpoints
  app.get("/api/status", (req, res) => {
    res.json(getBotStatus());
  });

  app.post("/api/connect", (req, res) => {
    const { host, port, username, version, auth } = req.body;
    if (!host) {
      return res.status(400).json({ success: false, message: "Sunucu IP adresi şart!" });
    }

    const result = connectMinecraftBot(
      {
        host,
        port: parseInt(port || "25565"),
        username: username || "Groq_AI_Bot",
        version: version || undefined,
        auth: auth || "offline",
      },
      memory
    );

    res.json(result);
  });

  app.post("/api/disconnect", (req, res) => {
    const result = disconnectMinecraftBot();
    res.json(result);
  });

  // Web Panel UI (Sade & Modern HTML)
  app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minecraft Groq AI Bot Paneli</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background: #121214; color: #e1e1e6; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .card { background: #202024; border: 1px solid #29292e; border-radius: 12px; width: 100%; max-width: 480px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
    h1 { font-size: 1.4rem; color: #00b37e; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    p.subtitle { font-size: 0.85rem; color: #a8a8b3; margin-bottom: 20px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 16px; text-transform: uppercase; }
    .status-offline { background: #2d1819; color: #f75a68; border: 1px solid #f75a68; }
    .status-online { background: #0e2d20; color: #00b37e; border: 1px solid #00b37e; }
    .status-connecting { background: #2d2618; color: #fba94c; border: 1px solid #fba94c; }
    .form-group { margin-bottom: 14px; }
    label { font-size: 0.85rem; color: #c4c4cc; display: block; margin-bottom: 6px; }
    input, select { width: 100%; padding: 10px 14px; background: #121214; border: 1px solid #29292e; border-radius: 6px; color: #fff; font-size: 0.95rem; outline: none; }
    input:focus { border-color: #00b37e; }
    .row { display: flex; gap: 10px; }
    .btn-group { display: flex; gap: 10px; margin-top: 18px; }
    button { flex: 1; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 0.95rem; }
    .btn-connect { background: #00b37e; color: #fff; }
    .btn-connect:hover { background: #00875f; }
    .btn-disconnect { background: #f75a68; color: #fff; }
    .btn-disconnect:hover { background: #c8414f; }
    .log-box { margin-top: 18px; background: #121214; border: 1px solid #29292e; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 0.8rem; color: #8d8d99; min-height: 48px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🤖 Groq Bot Kontrolü</h1>
    <p class="subtitle">API Anahtarı aktif. Sunucu bilgilerini girip bağlanabilirsin.</p>
    
    <div>
      <span id="statusBadge" class="status-badge status-offline">OFFLINE</span>
    </div>

    <form id="botForm">
      <div class="form-group">
        <label>Sunucu IP / Host</label>
        <input type="text" id="host" placeholder="ör. play.hypixel.net veya localhost" required>
      </div>

      <div class="row">
        <div class="form-group" style="flex: 1;">
          <label>Port</label>
          <input type="number" id="port" value="25565" required>
        </div>
        <div class="form-group" style="flex: 2;">
          <label>Bot Adı (Username)</label>
          <input type="text" id="username" value="Groq_AI_Bot" required>
        </div>
      </div>

      <div class="row">
        <div class="form-group" style="flex: 1;">
          <label>Versiyon (Opsiyonel)</label>
          <input type="text" id="version" placeholder="ör. 1.20.1 (Otomatik)">
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Giriş Tipi</label>
          <select id="auth">
            <option value="offline">Offline / Crack</option>
            <option value="microsoft">Microsoft (Orijinal)</option>
          </select>
        </div>
      </div>

      <div class="btn-group">
        <button type="button" class="btn-connect" onclick="connectBot()">Bağlan</button>
        <button type="button" class="btn-disconnect" onclick="disconnectBot()">Kapat</button>
      </div>
    </form>

    <div class="log-box" id="logBox">Sistem hazır.</div>
  </div>

  <script>
    async function updateStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        const badge = document.getElementById('statusBadge');
        badge.className = 'status-badge status-' + data.status;
        badge.innerText = data.status;

        document.getElementById('logBox').innerText = data.log || 'Durum bekleniyor...';
      } catch (e) {}
    }

    async function connectBot() {
      const body = {
        host: document.getElementById('host').value,
        port: document.getElementById('port').value,
        username: document.getElementById('username').value,
        version: document.getElementById('version').value,
        auth: document.getElementById('auth').value
      };

      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      alert(data.message);
      updateStatus();
    }

    async function disconnectBot() {
      const res = await fetch('/api/disconnect', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
      updateStatus();
    }

    setInterval(updateStatus, 3000);
    updateStatus();
  </script>
</body>
</html>
    `);
  });

  app.listen(port, () => {
    console.log(`🌐 Kontrol Paneli Aktif: http://localhost:${port}`);
  });
             }
