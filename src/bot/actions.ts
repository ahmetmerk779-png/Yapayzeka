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
      this.bot.chat(`${playerName}, seni göremiyorum! Çok mu uzaksın?`);
      return;
    }
    
    // Doğru kullanım: Sadece bot nesnesi verilir
    const defaultMove = new Movements(this.bot);
    
    defaultMove.canDig = false; 
    defaultMove.allow1by1towers = false;

    // @ts-ignore
    this.bot.pathfinder.setMovements(defaultMove);
    // @ts-ignore
    this.bot.pathfinder.setGoal(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 1.5));
  }

  public async stop(): Promise<void> {
    // @ts-ignore
    this.bot.pathfinder.setGoal(null);
  }
}
