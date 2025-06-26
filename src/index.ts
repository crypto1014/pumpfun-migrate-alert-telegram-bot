import WebSocket from "ws";
import { MIGRATE_SOCKET_DATA, NEW_TOKEN_SOCKET_DATA } from "./types";
import { writeFileSync } from "fs";
import { Telegraf } from "telegraf";
import express from "express";
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import cors from "cors";
import { PUMP_FUN_SIGNAL, PUMP_AMM_BUY_SIGNAL, PUMP_AMM_SELL_SIGNAL, PUMP_FUN_EVENT, PUMP_AMM_BUY_EVENT, PUMP_AMM_SELL_EVENT } from "./types";
import { decodePumpAMMData, decodePumpFunData } from "./decode";
import dotenv from 'dotenv'
import { getPumpDataFromMintAddress } from "./utils";

dotenv.config()
const app = express();
app.use(
  cors({
    origin: "*",
  })
);

const bot = new Telegraf(
  process.env.BOT_TOKEN || "7233575767:AAGKpAt9sBaXDt1QtMjbXpKpSFrlPA6WAH0"
);
const wsNewMint = new WebSocket(
  process.env.WEB_SOCKET_URL || "wss://pumpportal.fun/api/data"
);
const wsMigrate = new WebSocket(
  process.env.WEB_SOCKET_URL || "wss://pumpportal.fun/api/data"
);


const getInfoForSwapParams = (
  txInfo: any,
  isBuy: boolean
) => {
  try {
    const startTime = new Date();
    let mintAddress: string = "",
      solAmount: number = 0,
      price: number = 0,
      tokenAmount: number = 0,
      trader: string = "";
    let pumpFunProgramIndex = -1,
      pumpAmmProgramIndex = -1;
    // console.log({ accountKeys });

    let pumpFunInstructions = txInfo.meta.innerInstructions
      .flatMap((innerInstruction: any) => innerInstruction.instructions)
      .filter((instruction: any) =>
        instruction.data.startsWith(PUMP_FUN_SIGNAL)
      );
    let pumpAmmInstructions = isBuy
      ? txInfo.meta.innerInstructions
        .flatMap((innerInstruction: any) => innerInstruction.instructions)
        .filter((instruction: any) =>
          instruction.data.startsWith(PUMP_AMM_BUY_SIGNAL)
        )
      : txInfo.meta.innerInstructions
        .flatMap((innerInstruction: any) => innerInstruction.instructions)
        .filter((instruction: any) =>
          instruction.data.startsWith(PUMP_AMM_SELL_SIGNAL)
        );

    if (
      pumpFunInstructions.length === 0 &&
      pumpAmmInstructions.length === 0
    ) {
      console.log(`There is no PumpFun or PumpAMM Program`);
      return null;
    }
    if (pumpAmmInstructions.length > 0) {
      // Pump AMM Swap

      const bufferData = pumpAmmInstructions[0].data;

      const decodedData = decodePumpAMMData(bufferData);
      if (!decodedData) {
        console.log(`[error]: Not found data from buffer`);
        return null;
      }

      if (isBuy) {
        const pumpAmmEvent = decodedData.data as PUMP_AMM_BUY_EVENT;

        const poolAddress = pumpAmmEvent.pool.toBase58();
        mintAddress = txInfo.meta.preTokenBalances.find(
          (tokenBalance: any) =>
            tokenBalance.owner === poolAddress &&
            tokenBalance.mint !== "So11111111111111111111111111111111111111112"
        ).mint as string;
        trader = pumpAmmEvent.user.toBase58();
        price =
          pumpAmmEvent.pool_quote_token_reserves.toNumber() /
          pumpAmmEvent.pool_base_token_reserves.toNumber();
        tokenAmount = pumpAmmEvent.base_amount_out.toNumber() / 1_000_000;
        solAmount =
          pumpAmmEvent.quote_amount_in_with_lp_fee.toNumber() / 1_000_000_000;
      } else {
        const pumpAmmEvent = decodedData.data as PUMP_AMM_SELL_EVENT;

        const poolAddress = pumpAmmEvent.pool.toBase58();
        mintAddress = txInfo.meta.preTokenBalances.find(
          (tokenBalance: any) =>
            tokenBalance.owner === poolAddress &&
            tokenBalance.mint !== "So11111111111111111111111111111111111111112"
        ).mint as string;
        trader = pumpAmmEvent.user.toBase58();
        price =
          pumpAmmEvent.pool_quote_token_reserves.toNumber() /
          pumpAmmEvent.pool_base_token_reserves.toNumber();
        tokenAmount = pumpAmmEvent.base_amount_in.toNumber() / 1_000_000;
        solAmount =
          pumpAmmEvent.quote_amount_out_without_lp_fee.toNumber() /
          1_000_000_000;
      }
    }

    if (pumpFunInstructions.length > 0) {
      const bufferData = pumpFunInstructions[0].data;
      const decodedData = decodePumpFunData(bufferData);
      // console.log({ decodedData });
      if (!decodedData) {
        console.log(`[error]: Not found data from buffer`);
        return null;
      }
      const pumpFunEvent = decodedData.data as PUMP_FUN_EVENT;
      price =
        pumpFunEvent.virtual_sol_reserves.toNumber() /
        pumpFunEvent.virtual_token_reserves.toNumber();
      mintAddress = pumpFunEvent.mint.toBase58() as string;
      trader = pumpFunEvent.user.toBase58();
      solAmount = pumpFunEvent.sol_amount.toNumber() / 1_000_000_000;

      tokenAmount = pumpFunEvent.token_amount.toNumber() / 1_000_000;
    }

    const endTime = new Date();
    const usedTime = (endTime.getTime() - startTime.getTime()) / 1000;
    console.log(`Analyze Time: ${endTime.getTime()} - ${startTime.getTime()} = ${usedTime} s`)
    return {
      mintAddress: mintAddress,
      pumpAmmProgramIndex: pumpAmmProgramIndex,
      pumpFunProgramIndex: pumpFunProgramIndex,
      solAmount: solAmount,
      tokenAmount: tokenAmount,
      trader: trader,
      price: price,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

wsNewMint.on("open", function open() {
  // Subscribing to trades made by accounts
  let payload = {
    method: "subscribeNewToken",
    // keys: [""], // array of accounts to watch
  };
  wsNewMint.send(JSON.stringify(payload));
});

wsMigrate.on("open", function open() {
  // Subscribing to trades made by accounts
  let payload = {
    method: "subscribeMigration",
    // keys: [""], // array of accounts to watch
  };
  wsMigrate.send(JSON.stringify(payload));
});

wsMigrate.on("message", function message(data) {
  const parsedData = JSON.parse(data.toString()) as MIGRATE_SOCKET_DATA;
  console.log(parsedData);
  // bot.telegram.sendMessage(
  //   7346638281,
  //   `mintAddress: ${parsedData.mint}\nsignature: ${parsedData.signature}`
  // );
  writeFileSync("./logs/migrate.json", JSON.stringify(parsedData, null, 2), {
    flag: 'a'
  });
});

wsNewMint.on("message", async function message(data) {
  const parsedData = JSON.parse(data.toString()) as NEW_TOKEN_SOCKET_DATA;

  if (parsedData.solAmount === 1.980198019) {
    setTimeout(async () => {
      const pumpData = await getPumpDataFromMintAddress(parsedData.mint)
      if (pumpData) {
        writeFileSync("./logs/newToken1.98.json", JSON.stringify({ ...parsedData, secondVSol: pumpData.virtualSolReserves / LAMPORTS_PER_SOL, secondVToken: pumpData.virtualTokenReserves / 1_000_000 }, null, 2), {
          flag: 'a'
        });
        return
      }
      writeFileSync("./logs/newToken1.98.json", JSON.stringify(parsedData, null, 2), {
        flag: 'a'
      });

    }, 1000);
  }
  if (parsedData.solAmount === 3) {
    setTimeout(async () => {
      const pumpData = await getPumpDataFromMintAddress(parsedData.mint)
      if (pumpData) {
        writeFileSync("./logs/newToken3.json", JSON.stringify({ ...parsedData, secondVSol: pumpData.virtualSolReserves / LAMPORTS_PER_SOL, secondVToken: pumpData.virtualTokenReserves / 1_000_000 }, null, 2), {
          flag: 'a'
        });
        return
      }
      writeFileSync("./logs/newToken3.json", JSON.stringify(parsedData, null, 2), {
        flag: 'a'
      });

    }, 1000);
  }
  if (parsedData.solAmount === 2.5) {
    setTimeout(async () => {
      const pumpData = await getPumpDataFromMintAddress(parsedData.mint)
      if (pumpData) {
        writeFileSync("./logs/newToken2.5.json", JSON.stringify({ ...parsedData, secondVSol: pumpData.virtualSolReserves / LAMPORTS_PER_SOL, secondVToken: pumpData.virtualTokenReserves / 1_000_000 }, null, 2), {
          flag: 'a'
        });
        return
      }
      writeFileSync("./logs/newToken2.5.json", JSON.stringify(parsedData, null, 2), {
        flag: 'a'
      });

    }, 1000);
  }
  if (parsedData.solAmount === 2) {
    setTimeout(async () => {
      const pumpData = await getPumpDataFromMintAddress(parsedData.mint)
      if (pumpData) {
        writeFileSync("./logs/newToken2.json", JSON.stringify({ ...parsedData, secondVSol: pumpData.virtualSolReserves / LAMPORTS_PER_SOL, secondVToken: pumpData.virtualTokenReserves / 1_000_000 }, null, 2), {
          flag: 'a'
        });
        return
      }
      writeFileSync("./logs/newToken2.json", JSON.stringify(parsedData, null, 2), {
        flag: 'a'
      });

    }, 1000);
  }
  writeFileSync("./logs/newToken.json", JSON.stringify(parsedData, null, 2), {
    flag: 'a'
  });
});

app.listen(8008, () => console.log(`Server is Running on port ${8008}`));
