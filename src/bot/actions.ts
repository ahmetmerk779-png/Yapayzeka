import { Bot } from "mineflayer";

export class BotActions {
  private bot: Bot;
  constructor(bot: Bot) { this.bot = bot; }

  public async speak(message: string): Promise<string> {
    this.bot.chat(message);
    return `Mesaj atıldı: ${message}`;
  }

  public async stop(): Promise<string> {
    (this.bot as any).pathfinder?.stop();
    return "Durdu.";
  }
}
