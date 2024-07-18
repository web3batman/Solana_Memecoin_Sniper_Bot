import postRequest from "../utils/api";
import { IWalletInfo } from "@pages/mint/components/trading/wallet";

export const registerWallet = async (data: { privateKey: string }) => {
    try {
        return await postRequest('/wallet/privatekey', data, 'Register wallet')
    } catch (e) {
        return e;
    }
}

export const registerArbitWallet = async (data: { privateKey: string }) => {
    try {
        return await postRequest('/wallet/arbit-privatekey', data, 'Register arbitrage wallet')
    } catch (e) {
        return e;
    }
}

export const unwrapSol = async () => {
    try {
        return await postRequest('/wallet/unwrap', {}, 'Unwrap sol')
    } catch (e) {
        return e;
    }
}

export const sellTokens = async (data: { poolId: string, tokenMint?: string }) => {
    try {
        return await postRequest('/wallet/sell', data, 'Sell tokens')
    } catch (e) {
        return e;
    }
}

export const buyTokens = async (data: { poolId: string }) => {
    try {
        return await postRequest('/wallet/buy', data, 'Buy tokens')
    } catch (e) {
        return e;
    }
}

export const wrapSol = async () => {
    try {
        return await postRequest('/wallet/unwrap', {}, 'Wrap wsol in wallet')
    } catch (e) {
        return e;
    }
}

export const tokenMint = async (data: { name: string, symbol: string, metaURI: string, supply: number, decimal: number }) => {
    try {
        return await postRequest('/wallet/mint', data, 'Token mint')
    } catch (e) {
        return e;
    }
}

export const createMarket = async () => {
    try {
        return await postRequest('/wallet/market', {}, 'Create Market')
    } catch (e) {
        return e;
    }
}

export const tokenLaunch = async (data: { tokenAmt: number, solAmt: number, swapCounts: number, minPercent: number, maxPercent: number, isBurned: boolean, isFreeze: boolean }) => {
    try {
        return await postRequest('/wallet/launch', data, 'Create pool')
    } catch (e) {
        return e;
    }
}

export const swaptokens = async (data: {
    idx: number, buyToken: "base" | 'quote', amountSide: "send" | 'receive', amount: number, slippage: number
}) => {
    try {
        return await postRequest('/wallet/swaptokens', data, 'Swap tokens')
    } catch (e) {
        return e;
    }
}

export const removeLiquidity = async () => {
    try {
        return await postRequest('/wallet/removeliquidity', {}, 'Remove liquidity')
    } catch (e) {
        return e;
    }
}

export const autoBuy = async (data: { idx: number, option: IWalletInfo }) => {
    try {
        const title = data.option.buying ? `Auto buying ${data.idx + 1} started` : `Auto buying ${data.idx + 1} stopped`
        return await postRequest('/wallet/autobuying', data, title)
    } catch (e) {
        return e;
    }
}

export const autoSell = async (data: { idx: number, option: IWalletInfo }) => {
    try {
        const title = data.option.selling ? `Auto selling ${data.idx + 1} started` : `Auto selling ${data.idx + 1} stopped`
        return await postRequest('/wallet/autoselling', data, title)
    } catch (e) {
        return e;
    }
}

export const sendAllTokens = async (data: { counts: number, solPerWallet: number, tokenPerWallet: number, wallets: Array<string>, airdropAmt: number }) => {
    try {
        return await postRequest('/wallet/sendalltokens', data, 'Distribute tokens')
    } catch (e) {
        return e;
    }
}

export const refundSol = async (data: { idx: number }) => {
    try {
        return await postRequest('/wallet/refund', data, 'Refund sol')
    } catch (e) {
        return e;
    }
}

export const setOption = async (data: { idx: number, option: any }) => {
    try {
        return await postRequest('/wallet/setoption', data, 'Set options')
    } catch (e) {
        return e;
    }
}
