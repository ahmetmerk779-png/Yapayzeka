const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const collectBlock = require('mineflayer-collectblock');
const armorManager = require('mineflayer-armor-manager');
const autoEat = require('mineflayer-auto-eat');
const express = require('express');
const http = require('http');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'api_key_buraya' });

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

let botLogs = ["[Sistem] Sistem başlatıldı."];

function addLog(text) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${text}`;
    console.log(logEntry);
    botLogs.unshift(logEntry);
    if (botLogs.length > 50) botLogs.pop();
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sade, düz, temiz ve modern admin paneli arayüzü
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bot Yönetim Paneli</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f5f7; color: #333; padding: 20px; margin: 0; }
                .container { max-width: 500px; margin: 0 auto; }
                .card { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e1e4e8; }
                h2 { margin-top: 0; color: #2c3e50; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
                button { background: #2ecc71; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; font-size: 14px; }
                button:hover { background: #27ae60; }
                .log-box { background: #1e1e1e; padding: 12px; height: 160px; overflow-y: auto; font-family: monospace; font-size: 12px; border-radius: 6px; color: #a6e22e; line-height: 1.4; }
                input { width: 100%; box-sizing: border-box; padding: 10px; background: #fff; border: 1px solid #ccc; color: #333; border-radius: 6px; margin-bottom: 10px; font-size: 14px; outline: none; }
                input:focus { border-color: #2ecc71; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                .info-label { color: #666; }
                .info-value { font-weight: 600; color: #2c3e50; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <h2>Bot Bilgileri</h2>
                    <div class="info-row"><span class="info-label">Sunucu:</span><span class="info-value">play.aesirmc.com</span></div>
                    <div class="info-row"><span class="info-label">Durum:</span><span class="info-value" style="color: #2ecc71;">Aktif</span></div>
                </div>
                <div class="card">
                    <h2>Komut Gönder</h2>
                    <form method="POST" action="/command">
                        <input type="text" name="cmd" placeholder="Komut yazın (/server prison vb.)" required>
                        <button type="submit">Gönder</button>
                    </form>
                </div>
                <div class="card">
                    <h2>Konsol Logları</h2>
                    <div class="log-box">${botLogs.join('<br>')}</div>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.post('/command', (req, res) => {
    const command = req.body.cmd;
    if (bot && command) {
        bot.chat(command);
        addLog(`Komut girildi: ${command}`);
    }
    res.redirect('/');
});

server.listen(PORT, () => {
    console.log(`Panel ${PORT} portunda aktif.`);
});

let bot;

function createBot() {
    addLog('Sunucuya bağlanılıyor...');
    
    bot = mineflayer.createBot({
        host: 'play.aesirmc.com',
        port: 25565,
        username: 'BotKullaniciAdi',
        version: '1.21.1'
    });

    try {
        if (pathfinder) bot.loadPlugin(pathfinder);
        if (collectBlock && typeof collectBlock.plugin === 'function') bot.loadPlugin(collectBlock.plugin);
        else if (typeof collectBlock === 'function') bot.loadPlugin(collectBlock);
        if (typeof armorManager === 'function') bot.loadPlugin(armorManager);
        if (typeof autoEat === 'function') bot.loadPlugin(autoEat);
    } catch (e) {
        addLog('Plugin uyarısı: ' + e.message);
    }

    bot.once('spawn', () => {
        addLog('Oyuna giriş yapıldı.');
        
        setTimeout(() => {
            bot.chat('/login SifrenizBuraya123');
            addLog('Giriş şifresi gönderildi.');
        }, 2000);

        setTimeout(() => {
            handlePrisonTransition();
        }, 5000);
    });

    bot.on('windowOpen', (window) => {
        addLog('Menü / Doğrulama algılandı.');
        const slots = window.slots;
        for (let i = 0; i < slots.length; i++) {
            const item = slots[i];
            if (item && (item.name.includes('emerald') || item.name.includes('diamond'))) {
                bot.clickWindow(i, 0, 0);
                addLog(`${item.name} seçildi.`);
                break;
            }
        }
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;
        addLog(`<${username}>: ${message}`);

        if (message.toLowerCase().includes('bot') || message.startsWith('!')) {
            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: `Minecraft sunucusunda biri sana şunu yazdı: "${message}". Kısa, doğal ve oyuncu gibi Türkçe cevap ver.` }],
                    model: 'llama3-8b-8192',
                });
                const aiResponse = chatCompletion.choices[0]?.message?.content || 'Aynen öyle';
                bot.chat(aiResponse);
                addLog(`[AI] ${aiResponse}`);
            } catch (err) {
                addLog('AI hata: ' + err.message);
            }
        }
    });

    bot.on('end', (reason) => {
        addLog(`Bağlantı koptu (${reason}). 10 saniye sonra tekrar denenecek.`);
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => {
        addLog('Hata: ' + err.message);
    });
}

function handlePrisonTransition() {
    addLog('Prison geçişi deneniyor...');
    const compass = bot.inventory.items().find(item => item.name.includes('compass') || item.name.includes('star'));
    if (compass) {
        bot.clickWindow(compass.slot, 0, 0);
        addLog('Geçiş eşyasına tıklandı.');
    } else {
        bot.chat('/server prison');
        addLog('/server prison komutu gönderildi.');
    }
}

createBot();
