export interface MemoryEntry {
  timestamp: string;
  speaker: string;
  message: string;
}

export class MemoryManager {
  private chatHistory: MemoryEntry[] = [];
  private importantEvents: string[] = [];

  public addChatMessage(speaker: string, message: string): void {
    const timestamp = new Date().toLocaleTimeString("tr-TR");
    this.chatHistory.push({ timestamp, speaker, message });
    if (this.chatHistory.length > 20) this.chatHistory.shift();
  }

  public addEvent(eventDescription: string): void {
    const timestamp = new Date().toLocaleTimeString("tr-TR");
    this.importantEvents.push(`[${timestamp}] ${eventDescription}`);
    if (this.importantEvents.length > 15) this.importantEvents.shift();
  }

  public getFormattedChatHistory(): string {
    return this.chatHistory.length === 0 ? "Sohbet boş." : this.chatHistory.map(e => `[${e.timestamp}] ${e.speaker}: ${e.message}`).join("\n");
  }
}
