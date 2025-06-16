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
