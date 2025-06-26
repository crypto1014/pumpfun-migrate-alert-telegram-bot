import { Pump } from "@pump-fun/pump-sdk";
import { pumpIdl } from "@pump-fun/pump-sdk";
import { pumpAmmJson } from "@pump-fun/pump-swap-sdk";
import { logger } from "../services";
import { BorshCoder } from "@coral-xyz/anchor";
import bs58 from "bs58";
import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
export const decodePumpFunData = (data: string) => {
	try {
		if (data) {
			let buffer = Buffer.from(bs58.decode(data));
			// Remove first 8 bytes for the events cpi
			buffer = buffer.slice(8);
			const coder = new BorshCoder(pumpIdl as any);
			const args = coder.events.decode(base64.encode(buffer));
			return args;
		}
		return null;
	} catch (error) {
		logger.error(error);
		return null;
	}
};
export const decodePumpAMMData = (data: string) => {
	try {
		if (data) {
			let buffer = Buffer.from(bs58.decode(data));
			// Remove first 8 bytes for the events cpi
			buffer = buffer.slice(8);
			const coder = new BorshCoder(pumpAmmJson as any);
			const args = coder.events.decode(base64.encode(buffer));
			return args;
		}
		return null;
	} catch (error) {
		logger.error(error);
		return null;
	}
};
