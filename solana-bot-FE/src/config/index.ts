import { Connection } from "@solana/web3.js";

const solanaConnection = new Connection(import.meta.env.VITE_RPC_URL, {
    commitment: "confirmed",
});

const devConnection = new Connection(import.meta.env.VITE_DEV_RPC_URL, {
    commitment: "confirmed",
});

export const pinataAPIKey = import.meta.env.VITE_PINATA_API_KEY
export const pinataPublicURL = import.meta.env.VITE_PINATA_URL

solanaConnection
devConnection
// rpc set
export const connection = solanaConnection