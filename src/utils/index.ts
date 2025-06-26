import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PUMP_PROGRAM_ID } from "@pump-fun/pump-sdk";
import { IPumpData } from "../types";
import { connection } from "../config";
import { u8, u16, u64, struct, publicKey, bool } from "@raydium-io/raydium-sdk";

export async function getPumpDataFromMintAddress(
    mint: string
): Promise<IPumpData | null> {
    const mint_key = new PublicKey(mint);
    const mint_buffer = mint_key.toBuffer();
    const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonding-curve"), mint_buffer],
        PUMP_PROGRAM_ID
    );
    const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
        [bondingCurve.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint_buffer],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const accountInfo = await connection.getAccountInfo(
        new PublicKey(bondingCurve)
    );

    if (!accountInfo) return null;
    const structure = struct([
        u64("discriminator"),
        u64("virtualTokenReserves"),
        u64("virtualSolReserves"),
        u64("realTokenReserves"),
        u64("realSolReserves"),
        u64("tokenTotalSupply"),
        bool("complete"),
        publicKey("creator"),
    ]);
    const decoded = structure.decode(accountInfo.data);

    return {
        dev: decoded.creator.toString(),
        bondingCurve: bondingCurve.toBase58(),
        associatedBondingCurve: associatedBondingCurve.toBase58(),
        virtualSolReserves: decoded.virtualSolReserves.toNumber(),
        virtualTokenReserves: decoded.virtualTokenReserves.toNumber(),
    };
}