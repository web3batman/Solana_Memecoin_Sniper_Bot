import { PublicKey } from "@metaplex-foundation/js";
import { struct, u8, u64, publicKey } from "@raydium-io/raydium-sdk";

export interface IStakingResult {
  user: string;
  count: bigint;
  stakedAmount: bigint;
  time: bigint;
  period: bigint;
}

export type IPairInfo = {
  [key: string]: {
    address: string,
    decimals: string,
    name?: string,
    symbol?: string,
    uri?: string,
    image?: string,
    desc?: string,
  }
}

export const LOG_TYPE = struct([u8("log_type")]);

export const RAY_IX_TYPE = {
  CREATE_POOL: 0,
  ADD_LIQUIDITY: 1,
  BURN_LIQUIDITY: 2,
  SWAP: 3,
};
export const INIT_LOG = struct([
  u8("log_type"),
  u64("time"),
  u8("pc_decimals"),
  u8("coin_decimals"),
  u64("pc_lot_size"),
  u64("coin_lot_size"),
  u64("pc_amount"),
  u64("coin_amount"),
  publicKey("market"),
]);

export const ACTION_TYPE = {
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
  MINT: "mint",
  BURN: "burn",
  CREATE: "create",
  DEFAULT: "unknown",
};

export interface IPool {
  pairName: string;
  mintAuthority: any;
  freezeAuthority: any;
  description: any;
  links: {
    Transaction: string;
  };
  image: any;
  poolCreateAAmount: string;
  poolCreateBAmount: string;
  poolId: PublicKey;
  inputTokenInfo: any;
  outputTokenInfo: any;
  inputTokenAddr: PublicKey;
  outputTokenAddr: PublicKey;
}

