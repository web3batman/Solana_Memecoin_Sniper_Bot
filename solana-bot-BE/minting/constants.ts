import { config } from "dotenv"
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { web3 } from "@project-serum/anchor";

config();
function getKeypairFromStr(str: string): web3.Keypair | null {
    try {
        return web3.Keypair.fromSecretKey(Uint8Array.from(bs58.decode(str)))
    } catch (error) {
        return null
    }
}

// export const RPC_ENDPOINT_MAIN = "https://api.mainnet-beta.solana.com"
// export const RPC_ENDPOINT_DEV = "https://api.devnet.solana.com"
export const RPC_ENDPOINT_MAIN = "https://mainnet.helius-rpc.com/?api-key=0c5c423f-f0f5-4fe5-8a88-c8fe19eb5390"
export const RPC_ENDPOINT_DEV = "https://devnet.helius-rpc.com/?api-key=0c5c423f-f0f5-4fe5-8a88-c8fe19eb5390"

// export const RPC_ENDPOINT_MAIN = "http://127.0.0.1:8899"
// export const RPC_ENDPOINT_DEV = "http://127.0.0.1:8899"

const PINATA_API_kEY = process.env.PINATA_API_KEY!
const PINATA_DOMAIN = process.env.PINATA_DOMAIN!
const PINATA_API_SECRET_KEY = process.env.PINATA_API_SECRET_KEY!
const IN_PRODUCTION = process.env.PRODUCTION == '1' ? true : false
const COMPUTE_UNIT_PRICE = 1_800_000 // default: 200_000
// const JITO_AUTH_KEYPAIR = getKeypairFromStr(process.env.JITO_AUTH_KEYPAIR!)!
// const JITO_BLOCK_ENGINE_URL = process.env.JITO_BLOCK_ENGINE_URL!
// if (!JITO_AUTH_KEYPAIR || !JITO_BLOCK_ENGINE_URL) {
//     console.log("🚀 ~ JITO_BLOCK_ENGINE_URL:", JITO_BLOCK_ENGINE_URL)
//     console.log("🚀 ~ JITO_AUTH_KEYPAIR:", JITO_AUTH_KEYPAIR)
//     throw "Some ENV values not found"
// }

export const ENV = {
    PINATA_API_kEY,
    PINATA_API_SECRET_KEY,
    PINATA_DOMAIN,
    IN_PRODUCTION,
    COMPUTE_UNIT_PRICE,
    // JITO_AUTH_KEYPAIR,
    // JITO_BLOCK_ENGINE_URL
}
