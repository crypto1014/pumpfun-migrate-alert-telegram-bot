import { PublicKey, TokenAmount } from "@solana/web3.js";
import BN from "bn.js";
export type NEW_TOKEN_SOCKET_DATA = {
  signature: string;
  mint: string;
  traderPublicKey: string;
  txType: string;
  tokenAmount: number;
  solAmount: number;
  newTokenBalance: number;
  bondingCurveKey: string;
  vTokensInBondingCurve: number;
  pool: string;
};

export type MIGRATE_SOCKET_DATA = {
  signature: string;
  mint: string;
  txType: string;
  pool: string;
};

export const PUMP_FUN_SIGNAL = "2zjR1PvPvgqdhPdZLxuWC";
export const PUMP_AMM_SELL_SIGNAL = "9k6unfwB8yYie";

export const PUMP_AMM_BUY_SIGNAL = "9k6unfwB8yYkooTU";

export const WSOL = "So11111111111111111111111111111111111111112"


export type PUMP_FUN_EVENT = {
  mint: PublicKey;
  sol_amount: BN;
  token_amount: BN;
  is_buy: boolean;
  user: PublicKey;
  timestamp: BN;
  virtual_sol_reserves: BN;
  virtual_token_reserves: BN;
  real_sol_reserves: BN;
  real_token_reserves: BN;
  fee_recipient: PublicKey;
  fee_basis_points: BN;
  fee: BN;
  creator: PublicKey;
  creator_fee_basis_points: BN;
  creator_fee: BN;
};
export type PUMP_AMM_BUY_EVENT = {
  timestamp: BN;
  base_amount_out: BN;
  max_quote_amount_in: BN;
  user_base_token_reserves: BN;
  user_quote_token_reserves: BN;
  pool_base_token_reserves: BN;
  pool_quote_token_reserves: BN;
  quote_amount_in: BN;
  lp_fee_basis_points: BN;
  lp_fee: BN;
  protocol_fee_basis_points: BN;
  protocol_fee: BN;
  quote_amount_in_with_lp_fee: BN;
  user_quote_amount_in: BN;
  pool: PublicKey;
  user: PublicKey;
  user_base_token_account: PublicKey;
  user_quote_token_account: PublicKey;
  protocol_fee_recipient: PublicKey;
  protocol_fee_recipient_token_account: PublicKey;
  coin_creator: PublicKey;
  coin_creator_fee_basis_points: BN;
  coin_creator_fee: BN;
};

export type PUMP_AMM_SELL_EVENT = {
  timestamp: BN;
  base_amount_in: BN;
  min_quote_amount_out: BN;
  user_base_token_reserves: BN;
  user_quote_token_reserves: BN;
  pool_base_token_reserves: BN;
  pool_quote_token_reserves: BN;
  quote_amount_out: BN;
  lp_fee_basis_points: BN;
  lp_fee: BN;
  protocol_fee_basis_points: BN;
  protocol_fee: BN;
  quote_amount_out_without_lp_fee: BN;
  user_quote_amount_out: BN;
  pool: PublicKey;
  user: PublicKey;
  user_base_token_account: PublicKey;
  user_quote_token_account: PublicKey;
  protocol_fee_recipient: PublicKey;
  protocol_fee_recipient_token_account: PublicKey;
  coin_creator: PublicKey;
  coin_creator_fee_basis_points: BN;
  coin_creator_fee: BN;
};
