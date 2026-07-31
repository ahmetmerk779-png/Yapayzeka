import { startServer } from "./server";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log("Sistem başlatılıyor...");
startServer(PORT);
