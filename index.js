const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const collectBlock = require('mineflayer-collectblock');
const armorManager = require('mineflayer-armor-manager');
const autoEat = require('mineflayer-auto-eat');
const express = require('express');
const http = require('http');
const Groq = require('groq-sdk');

// --- GROQ AI BEYİN KURULUMU ---
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'api_key_buraya' });

// --- WEB PANELİ VE RENDER KEEP-ALIVE ALTYAPISI ---
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

let botLogs = ["[Sistem] Bot başlatılmayı bekliyor..."];

function addLog(text) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${text}`;
    console.log(logEntry);
    botLogs.unshift(logEntry);
    if (botLogs.length > 50) botLogs.pop();
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AesirMC Otonom Bot Paneli</title>
            <style>
                body { font-family: sans-serif; background: #121212; color: #e0e0e0; padding: 15px; margin: 0; }
                .card { background: #1e1e1e; padding: 15px; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
                h2 { margin-top: 0; color: #4CAF50; font-size: 18px; }
                button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 5px; }
                button:hover { background: #45a049; }
                .log-box { background: #000; padding: 10px; height: 180px; overflow-y: auto; font-family: monospace; font-size: 11px; border-radius: 4px; color: #00ff00; }
                input { width: calc(100% - 16px); padding: 8px; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 4px; margin-bottom: 8px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>🤖 Bot Durum Paneli</h2>
                <p><b>Sunucu:</b> play.aesirmc.com (Proxy)</p>
                <p><b>Durum:</b> <span style="color: #4CAF50;">Aktif / Otonom Çalışıyor</span></p>
            </div>
            <div class="card">
                <h2>⚡ Uzaktan Komut</h2>
                <form method="POST" action="/command">
                    <input type="text" name="cmd" placeholder="Örn: /server prison veya /help" required>
                    <button type="submit">Komut Gönder</button>
                </form>
            </div>
            <div class="card">
                <h2>📜 Canlı Konsol Logları</h2>
                <div class="log-box">${botLogs.join('<br>')}</div>
            </div>
        </body>
        </html>
    `);
});

app.post('/command', (req, res) => {
    const command = req.body.cmd;
    if (bot && command) {
        bot.chat(command);
        addLog(`[Panel] Komut gönderildi: ${command}`);
    }
    res.redirect('/');
});

server.listen(PORT, () => {
    console.log(`Web paneli ${PORT} portunda aktif.`);
});

// --- BOT ÇEKİRDEK MİMARİSİ ---
let bot;

function createBot() {
    addLog('Proxy sunucusuna bağlanılıyor...');
    
    bot = mineflayer.createBot({
        host: 'play.aesirmc.com',
        port: 25565,
        username: 'BotKullaniciAdi',
        version: '1.21.1'
    });

    // Doğru plugin yükleme formatı (Hata burada çözüldü)
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(collectBlock);
    bot.loadPlugin(armorManager);
    bot.loadPlugin(autoEat);

    bot.once('spawn', () => {
        addLog('Bot lobiye/proxy girişine başarıyla spawn oldu.');
        
        setTimeout(() => {
            bot.chat('/login SifrenizBuraya123');
            addLog('Auth şifresi gönderildi.');
        }, 2000);

        setTimeout(() => {
            handlePrisonTransition();
        }, 5000);
    });

    bot.on('windowOpen', (window) => {
        addLog('Dikkat: Bir GUI penceresi / Captcha algılandı!');
        const title = window.title ? JSON.parse(window.title).text : 'Bilinmeyen Menü';
        addLog(`Menü Başlığı: ${title}`);
        
        const slots = window.slots;
        for (let i = 0; i < slots.length; i++) {
            const item = slots[i];
            if (item && (item.name.includes('emerald') || item.name.includes('diamond'))) {
                bot.clickWindow(i, 0, 0);
                addLog(`Captcha/Menü içinde ${item.name} eşyasına tıklandı.`);
                break;
            }
        }
    });

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return;
        addLog(`[Chat] <${username}>: ${message}`);

        if (message.toLowerCase().includes('bot') || message.startsWith('!')) {
            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: `Minecraft sunucusunda bir oyuncu sana şunu yazdı: "${message}". Kısa, doğal ve bir oyuncu gibi Türkçe cevap ver.` }],
                    model: 'llama3-8b-8192',
                });
                const aiResponse = chatCompletion.choices[0]?.message?.content || 'Aynen öyle';
                bot.chat(aiResponse);
                addLog(`[AI Cevap] ${aiResponse}`);
            } catch (err) {
                addLog('Groq AI yanıt hatası: ' + err.message);
            }
        }
    });

    bot.on('end', (reason) => {
        addLog(`Bağlantı koptu! Sebep: ${reason}`);
        addLog('10 saniye sonra yeniden bağlanılıyor...');
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => {
        addLog('Bot hatası: ' + err.message);
    });
}

function handlePrisonTransition() {
    addLog('Prison moduna geçiş aranıyor (GUI / Pusula / Komut)...');
    const compass = bot.inventory.items().find(item => item.name.includes('compass') || item.name.includes('star') || item.name.includes('clock'));
    if (compass) {
        bot.clickWindow(compass.slot, 0, 0).then(() => {
            addLog('Geçiş eşyasına (pusula vb.) sağ tıklandı.');
        });
    } else {
        bot.chat('/server prison');
        addLog('/server prison komutu denendi.');
    }
}

createBot();
