import { startServer } from "./server";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log("Mindcraft AI Ajanı başlatılıyor...");
startServer(PORT);
