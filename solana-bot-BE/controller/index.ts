import { Metaplex } from "@metaplex-foundation/js";
import { solanaConnection } from "../config";
import { poolModel } from "../model"
import { pools } from "../sockets"
import { logger } from "../utils"
import { PublicKey } from "@solana/web3.js";

export const saveNewPool = async (poolId: string, poolState: string) => {
    try {
        let name;
        let symbol;
        let image;
        const metaplex = Metaplex.make(solanaConnection);
        const metadataAccount = metaplex
            .nfts()
            .pdas()
            .metadata({ mint: new PublicKey(poolState) });

        const metadataAccountInfo = await solanaConnection.getAccountInfo(metadataAccount);

        if (metadataAccountInfo) {
            const token = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(poolState) });
            name = token.name;
            symbol = token.symbol;
            image = token.json?.image;
        }
        const res = await poolModel.findOneAndUpdate({ poolId }, { poolId, poolState, name, symbol, image }, { upsert: true, new: true })
        pools()
    } catch (e) {
        logger.warn('db duplicated')
    }
}

export const returnPools = async () => {
    try {
        return await poolModel.find().sort({ _id: -1 }).limit(30)
    } catch (e) {
        console.log(e)
    }
}

export const buyStatus = async (poolId: string, status: number, signature: string) => {
    try {
        const res = await poolModel.findOneAndUpdate({ poolId }, { poolId, buy: status, buyTx: signature }, { upsert: true, new: true })
        pools()
    } catch (e) {
        console.log(e)
    }
}

export const sellStatus = async (poolId: string, status: number, signature: string) => {
    try {
        const res = await poolModel.findOneAndUpdate({ poolId }, { poolId, sell: status, sellTx: signature }, { upsert: true, new: true })
        pools()
    } catch (e) {
        console.log(e)
    }
}