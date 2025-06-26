export * from './socketdata.types'

export type IPumpData = {
    dev: string;
    bondingCurve: string;
    associatedBondingCurve: string;
    virtualSolReserves: number;
    virtualTokenReserves: number;
};