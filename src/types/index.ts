export interface BotConfig {
  host: string;
  port: number;
  username: string;
  version?: string;
  auth: "offline" | "microsoft";
}

export interface BotMemoryItem {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
}

export interface MemoryEntry {
  timestamp: string;
  speaker: string;
  message: string;
}
