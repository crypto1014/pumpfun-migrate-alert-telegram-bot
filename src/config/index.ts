import { Connection } from '@solana/web3.js'
import dotenv from 'dotenv'

dotenv.config()

export const connection = new Connection(process.env.RPC_URL || "", "confirmed")