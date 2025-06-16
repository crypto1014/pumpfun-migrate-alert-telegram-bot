import WebSocket from "ws";
import { MIGRATE_SOCKET_DATA } from "./types";
import { writeFileSync } from "fs";
import { Telegraf } from "telegraf";
const bot = new Telegraf(
  process.env.BOT_TOKEN || "7233575767:AAGKpAt9sBaXDt1QtMjbXpKpSFrlPA6WAH0"
);
const ws = new WebSocket(
  process.env.WEB_SOCKET_URL || "wss://pumpportal.fun/api/data"
);

ws.on("open", function open() {
  // Subscribing to trades made by accounts
  let payload = {
    method: "subscribeMigration",
    // keys: [""], // array of accounts to watch
  };
  ws.send(JSON.stringify(payload));
});

ws.on("message", function message(data) {
  const parsedData = JSON.parse(data.toString()) as MIGRATE_SOCKET_DATA;
  console.log(parsedData);
  bot.telegram.sendMessage(
    7346638281,
    `mintAddress: ${parsedData.mint}\nsignature: ${parsedData.signature}`
  );
  writeFileSync("./logs/migrate.json", JSON.stringify(parsedData, null, 2));
});
