import { Bot } from "mineflayer";
import { MemoryManager } from "./memory";

export function generateSystemContext(bot: Bot, memory: MemoryManager): string {
  if (!bot || !bot.entity) return "Bot yüklenmedi.";
  const pos = bot.entity.position;
  const inventory = bot.inventory.items().map(i => `${i.name} (${i.count})`).join(", ") || "Boş";

  return `Sen Minecraft 1.21.11 Paper sunucusunda bağımsız, gelişmiş bir otonom yapay zeka ajanısın. Adın: ${bot.username}.
Can: ${Math.round(bot.health)}/20 | Açlık: ${Math.round(bot.food)}/20
Konum: X:${Math.round(pos.x)} Y:${Math.round(pos.y)} Z:${Math.round(pos.z)}
Envanter: [${inventory}]

KURALLAR:
1. KESİNLİKLE JSON KULLANMA. İnsan gibi doğal ve akıcı konuş.
2. Eylem gerçekleştirmek için mesajının EN SONUNA köşeli parantez içinde komut ekle.
   Kullanılabilir Komutlar:
   - Oyuncunun yanına git: [GOTO:oyuncu_adi]
   - Hareketi durdur: [DUR:hemen]
   - Yakındaki bir bloğu kaz/kır: [KAZ:blok_adi] (Örn: [KAZ:stone])
3. Örnek: "Hemen yanına geliyorum dostum! [GOTO:Ahmet]"

Son Olaylar:
${memory.getFormattedEvents()}

Sohbet Geçmişi:
${memory.getFormattedChatHistory()}`;
}
