import { Bot } from "mineflayer";
import { Movements, goals } from "mineflayer-pathfinder";

export class BotActions {
  private bot: Bot;
  
  constructor(bot: Bot) { 
    this.bot = bot; 
  }

  public async speak(message: string): Promise<void> {
    if (message) this.bot.chat(message);
  }

  public async gotoPlayer(playerName: string): Promise<void> {
    const target = this.bot.players[playerName]?.entity;
    
    if (!target) {
      this.bot.chat(`${playerName}, seni etrafımda göremiyorum! Çok mu uzaktasın?`);
      return;
    }
    
    const defaultMove = new Movements(this.bot);
    defaultMove.canDig = true; 
    defaultMove.allow1by1towers = true;

    // @ts-ignore
    this.bot.pathfinder.setMovements(defaultMove);
    // @ts-ignore
    this.bot.pathfinder.setGoal(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
  }

  public async digBlock(blockName: string): Promise<void> {
    const mcData = require('minecraft-data')(this.bot.version);
    const blockType = mcData.blocksByName[blockName];
    
    if (!blockType) {
      this.bot.chat(`${blockName} adında bir blok türü bulamadım.`);
      return;
    }

    const block = this.bot.findBlock({
      matching: blockType.id,
      maxDistance: 32
    });

    if (!block) {
      this.bot.chat(`Yakınlarda kazacak ${blockName} bulamadım.`);
      return;
    }

    this.bot.chat(`${blockName} bloğunu buldum, kazmaya gidiyorum.`);
    const defaultMove = new Movements(this.bot);
    // @ts-ignore
    this.bot.pathfinder.setMovements(defaultMove);
    // @ts-ignore
    this.bot.pathfinder.setGoal(new goals.GoalGetToBlock(block.position.x, block.position.y, block.position.z));

    // @ts-ignore
    this.bot.pathfinder.once('goal_reached', async () => {
      try {
        // Tip denetimini es geçmek için as any kullanıyoruz
        if ((this.bot as any).canDig(block)) {
          await (this.bot as any).dig(block);
          this.bot.chat(`${blockName} başarıyla kazıldı!`);
        }
      } catch (err) {
        console.error("Kazma hatası:", err);
      }
    });
  }

  public async stop(): Promise<void> {
    // @ts-ignore
    this.bot.pathfinder.setGoal(null);
    this.bot.chat("Duraklatıldı.");
  }
}
