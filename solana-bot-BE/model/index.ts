import mongoose from "mongoose";
const { Schema } = mongoose;

const PoolSchema = new Schema({
    poolId: { type: String, required: true, unique: true },
    poolState: { type: String, required: true },
    buy: { type: Number, required: true, default: 0 },
    sell: { type: Number, required: true, default: 0 },
    sellTx: { type: String, default: '' },
    buyTx: { type: String, default: '' },
    name: { type: String, default: '' },
    symbol: { type: String, default: '' },
    image: { type: String, default: '' },
});

const walletSchema = new Schema({
    pubkey: { type: String},
    secretkey: { type: String},
    buy1: { type: Number},
    buy2: { type: Number},
    buyTime: { type: Number},
    sell1: { type: Number},
    sell2: { type: Number},
    sellTime: { type: Number},
    slippage: { type: Number},
    buying: { type: Boolean},
    selling: { type: Boolean}
});

const mintSchema = new Schema({
    net: { type: String },
    updateTime: { type: Date, default: Date.now },
    tokenId: { type: String },
    decimals: { type: Number },
    marketId: { type: String, },
    wallets: [walletSchema],
    solPerWallet: { type: Number, },
    tokenPerWallet: { type: Number, },
    airdropwallets: { type: [String], },
    airdropAmt: { type: Number, },
    poolId: { type: String, },
    baseVault: { type: String, },
    quoteVault: { type: String, }
});


export const poolModel = mongoose.model("pool", PoolSchema);
export const mintModel = mongoose.model("mint", mintSchema);
