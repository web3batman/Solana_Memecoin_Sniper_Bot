import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
import fs from 'fs'
import { logger, retrieveEnvVariable } from "../utils/utils";
import { initListener } from "../track/raydium";
dotenv.config();

try {
  dotenv.config();
} catch (error) {
  console.error("Error loading environment variables:", error);
  process.exit(1);
}

export const MONGO_URL = process.env.MONGO_URL || ""
export const ORIGIN_URL = process.env.ORIGIN_URL || ""
export const PORT = process.env.PORT || 9000
export const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET";
export const Raydium = new PublicKey(
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
);
export const RaydiumAuthority = new PublicKey(
  "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1"
);

export const LOG_LEVEL = retrieveEnvVariable('LOG_LEVEL', logger);
export const CHECK_IF_MINT_IS_RENOUNCED = retrieveEnvVariable('CHECK_IF_MINT_IS_RENOUNCED', logger) === 'true'
export const CHECK_IF_MINT_IS_FROZEN = retrieveEnvVariable('CHECK_IF_MINT_IS_FROZEN', logger) === 'true'
export const CHECK_IF_MINT_IS_MUTABLE = retrieveEnvVariable('CHECK_IF_MINT_IS_MUTABLE', logger) === 'true'
export const CHECK_IF_MINT_IS_BURNED = retrieveEnvVariable('CHECK_IF_MINT_IS_BURNED', logger) === 'true'
export const BLOCKENGINE_URL = retrieveEnvVariable('BLOCKENGINE_URL', logger)
export const JITO_AUTH_KEYPAIR = retrieveEnvVariable('JITO_KEY', logger)
export const JITO_FEE = Number(retrieveEnvVariable('JITO_FEE', logger))

export const RPC_ENDPOINT = retrieveEnvVariable('RPC_ENDPOINT', logger);
export const WEBSOCKET_ENDPOINT = retrieveEnvVariable('WEBSOCKET_ENDPOINT', logger);
export const RPC_SUB_ENDPOINT = retrieveEnvVariable('RPC_SUB_ENDPOINT', logger);
export const WEBSOCKET_SUB_ENDPOINT = retrieveEnvVariable('WEBSOCKET_SUB_ENDPOINT', logger);

export const DEV_NET_RPC = retrieveEnvVariable('DEV_NET_RPC', logger);
export const DEV_NET_WSS = retrieveEnvVariable('DEV_NET_WSS', logger);
export const DEV_NET_SUB_RPC = retrieveEnvVariable('DEV_NET_SUB_RPC', logger);
export const DEV_NET_SUB_WSS = retrieveEnvVariable('DEV_NET_SUB_WSS', logger);

export const solanaConnection = new Connection(RPC_ENDPOINT, { wsEndpoint: WEBSOCKET_ENDPOINT, commitment: "confirmed" });
export const solanaSubcribeConnection = new Connection(RPC_SUB_ENDPOINT, { wsEndpoint: WEBSOCKET_SUB_ENDPOINT, commitment: "confirmed" });
export const devConnection = new Connection(DEV_NET_RPC, { wsEndpoint: DEV_NET_WSS, commitment: "confirmed" });
export const devSubcribeConnection = new Connection(DEV_NET_SUB_RPC, { wsEndpoint: DEV_NET_SUB_WSS, commitment: "confirmed" });

export const sandwiches = ['arsc4jbDnzaqcCLByyGo7fg7S2SmcFsWUzQuDtLZh2y']

export const init = () => {
  fs.writeFileSync('raydium.json', JSON.stringify({}))
  initListener()
}