import { Server, Socket } from "socket.io";
import fs from 'fs'
import { logger } from "../utils";
import { solanaConnection } from "../config";
import { returnPools } from "../controller";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { NATIVE_MINT, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { walletTokenList } from "./utils";

export let sokcetServer: Server
export const socketProvider = (io: Server) => {
    sokcetServer = io
    try {
        sokcetServer.on("connection", (socket: Socket) => {
            logger.info(`User: ${socket.id} connected`)
            pools()
            // const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
            const mintingData = JSON.parse(fs.readFileSync("minting.json", `utf8`))

            initialConnection()
            sokcetServer.emit('minting', mintingData)

            socket.on("disconnect", () => {
                logger.info(`User: ${socket.id} disconnected`)
            })

            socket.on('autoSell', (autoSell: boolean) => {
                console.log('autoSell', autoSell)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.autoSell = autoSell
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('method', (method: boolean) => {
                console.log('method', method)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.onceBuy = method
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('jitoMode', (jitoMode: boolean) => {
                console.log('jitoMode', jitoMode)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.jitoMode = jitoMode
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('sell_option', (option: any) => {
                console.log('sell_option', option)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.profit = option.profit
                data.stop = option.stop
                data.sellGas = option.sellGas
                data.delay = option.delay
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('filter', (option: any) => {
                console.log('filter', option)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.minSize = option.min
                data.maxSize = option.max
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('buy_option', (option: any) => {
                console.log('buy_option', option)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.amount = option.amount
                data.buyGas = option.buyGas
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('jitoFee', (jitoFee: number) => {
                console.log('jitoFee', jitoFee)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.jitoFee = jitoFee
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('running', (running: boolean) => {
                console.log('running', running)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.running = running
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('autobuy', (autobuy: boolean) => {
                console.log('autobuy', autobuy)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.autoBuy = autobuy
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('arbitrage', (arbitrage: boolean) => {
                console.log('arbitrage', arbitrage)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.arbitrage = arbitrage
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('arbitrage_option', (option: { baseToken: string, quoteToken: string, arbitrageAmount: number }) => {
                console.log('arbitrage_option', option)
                const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
                data.baseToken = option.baseToken
                data.quoteToken = option.quoteToken
                data.arbitrageAmount = option.arbitrageAmount
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
                broadCast(data)
            })

            socket.on('mintOption', (option: any) => {
                console.log('mintOption')
                const mintingData = JSON.parse(fs.readFileSync("minting.json", `utf8`))
                mintingData.wallets[option.num] = option.walletInfo
                fs.writeFileSync('minting.json', JSON.stringify(mintingData, null, 4))
            })

        });
    } catch (e) {
        console.log('socketProvider\n', e)
    }
}

export const broadCast = async (data: any) => {
    try {
        console.log('broadcast')
        const balance = (await solanaConnection.getBalance(new PublicKey(data.pubKey))) / LAMPORTS_PER_SOL
        const wsolAddr = getAssociatedTokenAddressSync(NATIVE_MINT, new PublicKey(data.pubKey))
        const wsolBalance = (await solanaConnection.getBalance(wsolAddr)) / LAMPORTS_PER_SOL
        const arbitBalance = (await solanaConnection.getBalance(new PublicKey(data.arbitPubKey))) / LAMPORTS_PER_SOL
        const arbitWsolAddr = getAssociatedTokenAddressSync(NATIVE_MINT, new PublicKey(data.arbitPubKey))
        const arbitWsolBalance = (await solanaConnection.getBalance(arbitWsolAddr)) / LAMPORTS_PER_SOL

        sokcetServer.emit('process', { ...data, balance, wsolBalance, arbitBalance, arbitWsolBalance })
        tokens(data.pubKey)
    } catch (e) {
        console.log('broadcast\n', e)
    }
}

export const initialConnection = async () => {
    try {
        const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
        broadCast(data)
    } catch (e) {
        console.log('no json data')
        sokcetServer.emit('process')
    }
}

export const pools = async () => {
    try {
        const pools = await returnPools()
        const addrInfo = JSON.parse(fs.readFileSync("data.json", `utf8`))
        const balance = (await solanaConnection.getBalance(new PublicKey(addrInfo.pubKey))) / LAMPORTS_PER_SOL
        const wsolAddr = getAssociatedTokenAddressSync(NATIVE_MINT, new PublicKey(addrInfo.pubKey))
        const wsolBalance = (await solanaConnection.getBalance(wsolAddr)) / LAMPORTS_PER_SOL

        sokcetServer.emit("pools", { pools, balance, wsolBalance })
    } catch (e) {
        console.log('pools\n', e)
    }
}

const tokens = async (pubKey: string) => {
    const list = await walletTokenList(pubKey)
    sokcetServer.emit("tokens", list)
}