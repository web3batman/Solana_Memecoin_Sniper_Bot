import lo from "lodash";
import {
    ApiPoolInfoV4,
    BigNumberish,
    jsonInfo2PoolKeys,
    Liquidity,
    LIQUIDITY_STATE_LAYOUT_V4,
    LiquidityPoolKeys,
    LiquidityPoolKeysV4,
    Percent,
    Token,
    TokenAmount,
} from '@raydium-io/raydium-sdk'
import {
    createAssociatedTokenAccountIdempotentInstruction,
    createAssociatedTokenAccountInstruction,
    createCloseAccountInstruction,
    createSyncNativeInstruction,
    getAssociatedTokenAddress,
    NATIVE_MINT,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
    Keypair,
    PublicKey,
    TransactionMessage,
    VersionedTransaction,
    TransactionInstruction,
    SystemProgram,
    ParsedTransactionWithMeta,
    Logs,
    ComputeBudgetProgram,
} from '@solana/web3.js'
import base58 from "bs58";
import { getTokenAccounts, RAYDIUM_LIQUIDITY_PROGRAM_ID_V4, LOG_TYPE, RAY_IX_TYPE, SOL_ADDRESS } from '../../utils'
import { logger } from '../../utils'
import { MinimalMarketLayoutV3 } from '../../utils'
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import bs58 from 'bs58'
import fs from 'fs'
import {
    LOG_LEVEL,
    CHECK_IF_MINT_IS_RENOUNCED,
    CHECK_IF_MINT_IS_BURNED,
    CHECK_IF_MINT_IS_FROZEN,
    solanaSubcribeConnection,
} from '../../config'
import { solanaConnection } from '../../config'
import { checkBurn, checkFreezable, checkMintable } from './tokenFilter'
import { bundle } from './executor/jito'
import { execute } from './executor/legacy'
import { Server } from 'socket.io';
import { buyStatus, saveNewPool, sellStatus } from '../../controller';
import axios, { AxiosError } from "axios";
import { formatAmmKeysById } from '../../utils/swap';
import { BN } from "bn.js";

export interface MinimalTokenAccountData {
    mint: PublicKey
    address: PublicKey
    poolKeys?: LiquidityPoolKeys
    market?: MinimalMarketLayoutV3
}

interface Blockhash {
    blockhash: string;
    lastValidBlockHeight: number;
}

export const existingTokenAccounts: Map<string, MinimalTokenAccountData> = new Map<string, MinimalTokenAccountData>()

const COMMITMENT_LEVEL = 'confirmed'

let wallet: Keypair
let quoteToken: Token
let quoteTokenAssociatedAddress: PublicKey
let quoteAmount: TokenAmount
let quoteMinPoolSizeAmount: TokenAmount
let quoteMaxPoolSizeAmount: TokenAmount
let processingToken: Boolean = false

let running: Boolean = false
let flag: Boolean = false
let autoBuy: boolean = false
let minSize: number = 0
let maxSize: number = 0
let autoSell: boolean = false
let profit: number = 0
let sellDelay: number = 0
let solAmount: number = 0
let buygas: number = 0
let sellgas: number = 0
let onceBuy: boolean = false
let monitoring: boolean = false
let jitoMode: boolean = false
let jitoFee: number = 0
let stopLoss: number = 0

const waitFor = (delay: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, delay));
};

export const initListener = async (): Promise<void> => {
    logger.info('Initialize')
    logger.level = LOG_LEVEL
    const data = JSON.parse(fs.readFileSync("data.json", `utf8`))

    // get wallet
    const PRIVATE_KEY = data.privKey
    wallet = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
    autoBuy = data.autoBuy
    autoSell = data.autoSell
    profit = data.profit
    sellDelay = data.delay
    minSize = data.minSize
    maxSize = data.maxSize
    solAmount = data.amount
    buygas = data.buyGas
    sellgas = data.sellGas
    flag = data.flag
    running = data.running
    onceBuy = data.onceBuy
    monitoring = data.monitoring
    jitoMode = data.jitoMode
    jitoFee = data.jitoFee
    stopLoss = data.stop

    const listeners = JSON.parse(fs.readFileSync('raydium.json', `utf8`))
    if (running) {
        if (listeners.raydiumLogId == undefined && listeners.walletSubscriptionId == undefined) runListener()
    }
    else {
        console.log('remove listeners')
        solanaSubcribeConnection.removeOnLogsListener(listeners.raydiumLogId)
        solanaSubcribeConnection.removeOnLogsListener(listeners.walletSubscriptionId)
        listeners.raydiumLogId = undefined
        listeners.walletSubscriptionId = undefined
        fs.writeFileSync('raydium.json', JSON.stringify(listeners, null, 4))
    }
    // get quote mint and amount
    quoteToken = Token.WSOL
    quoteAmount = new TokenAmount(Token.WSOL, solAmount, false)
    quoteMinPoolSizeAmount = new TokenAmount(quoteToken, minSize, false)
    quoteMaxPoolSizeAmount = new TokenAmount(quoteToken, maxSize, false)

    // check existing wallet for associated token account of quote mint
    const tokenAccounts = await getTokenAccounts(solanaConnection, wallet.publicKey, COMMITMENT_LEVEL)

    for (const ta of tokenAccounts) {
        existingTokenAccounts.set(ta.accountInfo.mint.toString(), <MinimalTokenAccountData>{
            mint: ta.accountInfo.mint,
            address: ta.pubkey,
        })
    }

    quoteTokenAssociatedAddress = getAssociatedTokenAddressSync(NATIVE_MINT, wallet.publicKey)

    // const wsolBalance = await solanaConnection.getBalance(quoteTokenAssociatedAddress)
    // if (!(!wsolBalance || wsolBalance == 0))
    // unwrapSol(quoteTokenAssociatedAddress)
}

const processRaydiumPool = async (signature: string) => {
    try {
        console.log('processRaydiumPool', signature)
        const tx = await solanaConnection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        })

        const innerInstructions = tx?.meta?.innerInstructions
        const postTokenBalances = tx?.meta?.postTokenBalances
        let baseMint: string = ''
        let poolId: string = ''
        let solAmount: number = 0
        innerInstructions?.map((mt: any) => {
            mt.instructions.map((item: any) => {
                // @ts-ignore
                if (item.parsed?.type == "initializeAccount" && item.parsed?.info.mint.toString() != SOL_ADDRESS.toString()) {
                    // @ts-ignore
                    baseMint = item.parsed?.info.mint.toString()
                }
                // @ts-ignore
                if (item.parsed?.type == "allocate" && item.parsed?.info.space == 752) {
                    // @ts-ignore
                    poolId = item.parsed?.info.account.toString()
                }
            })
        })

        postTokenBalances?.map((balance: any) => {
            if (balance.mint == SOL_ADDRESS.toString() && balance.owner == "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1" && balance.programId == "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") solAmount = balance.uiTokenAmount.uiAmount
        })

        console.log('mint', baseMint)
        console.log('poolId', poolId)
        console.log('solAmount', solAmount)

        if (!baseMint || !poolId || !solAmount) return

        if (solAmount > maxSize || solAmount < minSize) {
            console.log('pool size is out of range')
            return
        }


        const info = await solanaConnection.getAccountInfo(new PublicKey(poolId))
        if (info?.data) {
            const poolState = LIQUIDITY_STATE_LAYOUT_V4.decode(info?.data)
            if (CHECK_IF_MINT_IS_RENOUNCED) {
                const mintOption = await checkMintable(solanaConnection, new PublicKey(baseMint))
                if (mintOption !== true) {
                    logger.warn({ mint: baseMint }, 'Skipping, owner can mint tokens!')
                    return
                }
            }

            if (CHECK_IF_MINT_IS_FROZEN) {
                const burned = await checkFreezable(solanaConnection, new PublicKey(baseMint))
                if (burned !== true) {
                    logger.warn({ mint: baseMint }, 'Skipping, token can freeze!')
                    return
                }
            }

            if (CHECK_IF_MINT_IS_BURNED) {
                const burned = await checkBurn(solanaConnection, poolState.lpMint, COMMITMENT_LEVEL)
                if (burned !== true) {
                    logger.warn({ mint: baseMint }, 'Skipping, token is not burned!')
                    return
                }
            }

            if (running) saveNewPool(poolId.toString(), baseMint.toString())
            const poolKeys = jsonInfo2PoolKeys(await formatAmmKeysById(poolId.toString())) as LiquidityPoolKeys
            if (autoBuy && !processingToken) {
                processingToken = true
                console.log('buying processingToken', processingToken)
                await buy(new PublicKey(poolId), new PublicKey(baseMint), poolKeys)
            }
        }
        return
    } catch (e) {
        console.log(e)
        return null
    }
}

const handleWalletUpdated = async (updatedWalletLogs: Logs) => {
    try {
        const startTime = new Date().getTime()
        const log = updatedWalletLogs.logs;
        const signature = updatedWalletLogs.signature;
        const error = updatedWalletLogs.err;
        const ray_log_row = lo.find(log, (y) => y.includes("ray_log"));

        if (!error && ray_log_row) {
            try {
                const match = ray_log_row.match(/ray_log: (.*)/)
                if (match?.length) {
                    const ray_data = Buffer.from(
                        match[1],
                        "base64"
                    );
                    const log_type = LOG_TYPE.decode(ray_data).log_type;
                    if (log_type == RAY_IX_TYPE.SWAP) {
                        let tx: ParsedTransactionWithMeta | null = null
                        let cnt = 0
                        while (tx == null) {
                            tx = await solanaConnection.getParsedTransaction(signature, {
                                maxSupportedTransactionVersion: 0,
                                commitment: 'confirmed'
                            });
                            cnt++
                        }
                        console.log('tx count', cnt)
                        const inx = tx?.transaction.message.instructions
                        const meta = tx?.meta?.innerInstructions
                        const spl_associated_token_account: any = []
                        let num = 0
                        let pubkey: string = ''
                        let mint: string = ''
                        let ata: string = ''
                        let amount: string = ''
                        let poolId: string = ''

                        inx?.map((instruction, idx) => {
                            if (instruction.programId.toString() == "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL") {
                                // @ts-ignore
                                if (instruction.parsed.type == 'createIdempotent') {
                                    num = idx
                                    // @ts-ignore
                                    spl_associated_token_account.push(instruction.parsed.info)
                                }
                            }

                            if (instruction.programId.toString() == "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8") {
                                // @ts-ignore
                                poolId = instruction.accounts[1].toString()
                            }
                        })

                        if (spl_associated_token_account && meta && inx) {
                            if (wallet.publicKey.toString() != spl_associated_token_account[0].source) return
                            pubkey = spl_associated_token_account[0].source
                            mint = spl_associated_token_account[0].mint
                            ata = spl_associated_token_account[0].account
                        }

                        meta?.map(mt => {
                            if (mt.index == num + 1)
                                mt.instructions.map((item, idx) => {
                                    // @ts-ignore
                                    if (item.parsed.info.authority && item.parsed.info.authority != pubkey) amount = item.parsed.info.amount
                                })
                        })

                        try {
                            if (!poolId || !ata || !mint || !amount) return
                            buyStatus(poolId, 2, '')
                            const poolKeys = jsonInfo2PoolKeys(await formatAmmKeysById(poolId.toString())) as LiquidityPoolKeys
                            console.log('selling...', new Date().getTime() - startTime)
                            sellStatus(poolId.toString(), 1, '')
                            if (autoSell) {
                                if (sellDelay > 0) {
                                    logger.info("Delay timer activated")
                                    await sleep(sellDelay * 1000)
                                    logger.info("Delay timer ended")
                                }
                                const mintInfo = await solanaConnection.getParsedAccountInfo(new PublicKey(mint))
                                // @ts-ignore
                                const decimals = mintInfo.value?.data.parsed.info.decimals
                                const tokenIn = new Token(TOKEN_PROGRAM_ID, new PublicKey(mint), decimals)
                                const tokenAmountIn = new TokenAmount(tokenIn, new BN(amount), true)
                                await priceMatch(tokenAmountIn, poolKeys)
                            }
                            await sell(new PublicKey(poolId), new PublicKey(ata), new PublicKey(mint), amount, poolKeys)
                        } catch (e) {
                            console.log(e)
                        }
                    } else return
                } else return
            } catch (ex) {
                console.error(ex);
            }
        }
    } catch (ex) {
        console.error(ex);
    }
}

export const saveTokenAccount = (mint: PublicKey, accountData: MinimalMarketLayoutV3) => {
    const ata = getAssociatedTokenAddressSync(mint, wallet.publicKey)
    const tokenAccount = <MinimalTokenAccountData>{
        address: ata,
        mint: mint,
        market: <MinimalMarketLayoutV3>{
            bids: accountData.bids,
            asks: accountData.asks,
            eventQueue: accountData.eventQueue,
        },
    }
    existingTokenAccounts.set(mint.toString(), tokenAccount)
    return tokenAccount
}

const sleep = async (ms: number) => {
    await new Promise((resolve) => setTimeout(resolve, ms))
}

const jitoWithAxios = async (transaction: VersionedTransaction, payer: Keypair, latestBlockhash: Blockhash) => {

    logger.debug('Starting Jito transaction execution...');
    const tipAccounts = [
        'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
        'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
        '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
        '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
        'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
        'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
        'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
        'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
    ];
    const jitoFeeWallet = new PublicKey(tipAccounts[Math.floor(tipAccounts.length * Math.random())])

    logger.warn(`Selected Jito fee wallet: ${jitoFeeWallet.toBase58()}`);

    try {
        logger.warn(`Calculated fee: ${jitoFee / 10 ** 9} sol`);

        const jitTipTxFeeMessage = new TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: [
                SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: jitoFeeWallet,
                    lamports: jitoFee,
                }),
            ],
        }).compileToV0Message();

        const jitoFeeTx = new VersionedTransaction(jitTipTxFeeMessage);
        jitoFeeTx.sign([payer]);


        const jitoTxsignature = base58.encode(jitoFeeTx.signatures[0]);

        // Serialize the transactions once here
        const serializedjitoFeeTx = base58.encode(jitoFeeTx.serialize());
        const serializedTransaction = base58.encode(transaction.serialize());
        const serializedTransactions = [serializedjitoFeeTx, serializedTransaction];

        const endpoints = [
            'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
            'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
            'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
            'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
            'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles',
        ];

        const requests = endpoints.map((url) =>
            axios.post(url, {
                jsonrpc: '2.0',
                id: 1,
                method: 'sendBundle',
                params: [serializedTransactions],
            }),
        );

        logger.warn('Sending transactions to endpoints...');
        const results = await Promise.all(requests.map((p) => p.catch((e) => e)));

        const successfulResults = results.filter((result) => !(result instanceof Error));

        if (successfulResults.length > 0) {
            logger.warn(`Successful response`);

            const confirmation = await solanaConnection.confirmTransaction(
                {
                    signature: jitoTxsignature,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                    blockhash: latestBlockhash.blockhash,
                },
                COMMITMENT_LEVEL,
            );

            return { confirmed: !confirmation.value.err, jitoTxsignature };
        } else {
            logger.warn(`No successful responses received for jito`);
        }

        return { confirmed: false };
    } catch (error) {

        if (error instanceof AxiosError) {
            logger.warn({ error: error.response?.data }, 'Failed to execute jito transaction');
        }
        logger.error('Error during transaction execution', error);
        return { confirmed: false };
    }
}

const buy = async (accountId: PublicKey, baseMint: PublicKey, poolKeys: LiquidityPoolKeysV4): Promise<void> => {
    try {
        console.log('buying...')
        buyStatus(accountId.toString(), 1, '')
        const { innerTransaction } = Liquidity.makeSwapFixedInInstruction(
            {
                poolKeys: poolKeys,
                userKeys: {
                    tokenAccountIn: quoteTokenAssociatedAddress,
                    tokenAccountOut: getAssociatedTokenAddressSync(baseMint, wallet.publicKey),
                    owner: wallet.publicKey,
                },
                amountIn: quoteAmount.raw,
                minAmountOut: 0,
            },
            poolKeys.version,
        )

        const instructions: TransactionInstruction[] = []

        if (!await solanaConnection.getAccountInfo(quoteTokenAssociatedAddress))
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    quoteTokenAssociatedAddress,
                    wallet.publicKey,
                    NATIVE_MINT,
                )
            )
        instructions.push(
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 }),
            ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: quoteTokenAssociatedAddress,
                lamports: Math.ceil(solAmount * 10 ** 9),
            }),
            createSyncNativeInstruction(quoteTokenAssociatedAddress, TOKEN_PROGRAM_ID),
            createAssociatedTokenAccountIdempotentInstruction(
                wallet.publicKey,
                getAssociatedTokenAddressSync(baseMint, wallet.publicKey),
                wallet.publicKey,
                baseMint,
            ),
            ...innerTransaction.instructions,
        )

        const latestBlockhash = await solanaConnection.getLatestBlockhash({
            commitment: 'confirmed',
        })

        const messageV0 = new TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions,
        }).compileToV0Message()
        const transaction = new VersionedTransaction(messageV0)

        transaction.sign([wallet, ...innerTransaction.signers])

        if (jitoMode) {
            if (false) {
                await jitoWithAxios(transaction, wallet, latestBlockhash)
            } else {
                const result = await bundle([transaction], wallet)
                // if (!result) {
                //     processingToken = false
                //     buyStatus(poolId.toString(), 3, '')
                // }
            }
        } else {
            const res = await execute(transaction, latestBlockhash)
            if (!res) {
                console.log('bought failed')
                buyStatus(accountId.toString(), 3, '')
                processingToken = false
                console.log('buy failed processingToken', processingToken)
                return
            }
        }
        console.log('bought success')
    } catch (e) {
        buyStatus(accountId.toString(), 3, '')
        processingToken = false
        console.log('buy issue processingToken', processingToken)
        logger.debug(e)
        logger.error(`Failed to buy token, ${baseMint.toString()}`)
    }
}

// poolId, ata, mint, balance.value.amount
const sell = async (poolId: PublicKey, ata: PublicKey, mint: PublicKey, amount: string, poolKeys: LiquidityPoolKeys, sellAgain: boolean = true): Promise<void> => {

    try {
        if (!sellAgain) {
            const info = await solanaConnection.getTokenAccountBalance(ata)
            // @ts-ignore
            if (info.value.uiAmount == 0) return
        }
        const { innerTransaction } = Liquidity.makeSwapFixedInInstruction(
            {
                poolKeys,
                userKeys: {
                    tokenAccountOut: quoteTokenAssociatedAddress,
                    tokenAccountIn: ata,
                    owner: wallet.publicKey,
                },
                amountIn: amount,
                minAmountOut: 0,
            },
            poolKeys.version,
        )

        const latestBlockhash = await solanaConnection.getLatestBlockhash({
            commitment: 'confirmed',
        })

        const messageV0 = new TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: [
                ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 }),
                ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
                ...innerTransaction.instructions,
                // createCloseAccountInstruction(quoteTokenAssociatedAddress, wallet.publicKey, wallet.publicKey),
            ],
        }).compileToV0Message()

        const transaction = new VersionedTransaction(messageV0)

        transaction.sign([wallet, ...innerTransaction.signers])

        {
            const res = await execute(transaction, latestBlockhash)
            if (res) sellStatus(poolId.toString(), 2, '')
            else {
                // await sell(poolId, ata, mint, amount, poolKeys, false)
                sellStatus(poolId.toString(), 3, '')
            }
        }

        console.log('sell finish')
    } catch (e: any) {
        sellStatus(poolId.toString(), 3, '')
        console.log(e)
        logger.debug(e)
    }

    processingToken = false
    console.log('sell finish processingToken', processingToken)
}

export const manualsell = async (mint: string, poolId: string): Promise<void> => {

    try {
        const targetPoolInfo = await formatAmmKeysById(poolId)
        if (!targetPoolInfo) return

        const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys
        const sourceAccount = await getAssociatedTokenAddress(
            new PublicKey(mint),
            wallet.publicKey
        );
        if (!sourceAccount) {
            logger.error("Sell token account not exist")
            return
        }

        const info = await solanaConnection.getTokenAccountBalance(sourceAccount)
        const amount = Number(info.value.amount)
        if (poolKeys) {
            logger.warn({ mint }, 'No pool keys found')
            return
        }

        if (amount == 0) {
            logger.info(
                {
                    mint,
                },
                `Empty balance, can't sell`,
            )
            return
        }
        const { innerTransaction } = Liquidity.makeSwapFixedInInstruction(
            {
                poolKeys,
                userKeys: {
                    tokenAccountOut: quoteTokenAssociatedAddress,
                    tokenAccountIn: sourceAccount,
                    owner: wallet.publicKey,
                },
                amountIn: amount,
                minAmountOut: 0,
            },
            4,
        )

        const latestBlockhash = await solanaConnection.getLatestBlockhash({
            commitment: COMMITMENT_LEVEL,
        })

        const messageV0 = new TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: [
                ...innerTransaction.instructions,
                createCloseAccountInstruction(quoteTokenAssociatedAddress, wallet.publicKey, wallet.publicKey),
            ],
        }).compileToV0Message()

        const transaction = new VersionedTransaction(messageV0)
        transaction.sign([wallet, ...innerTransaction.signers])

        if (jitoMode) {
            if (false) {
                await jitoWithAxios(transaction, wallet, latestBlockhash)
            } else {
                await bundle([transaction], wallet)
            }
        } else {
            await execute(transaction, latestBlockhash)
        }
    } catch (e: any) {
        await sleep(1000)
        logger.debug(e)
    }

}

export const unwrapSol = async (wallet: Keypair, quoteMintAddress: PublicKey) => {
    try {
        console.log(wallet, quoteMintAddress)
        const wsolAccountInfo = await solanaConnection.getAccountInfo(quoteMintAddress)
        if (wsolAccountInfo) {
            const wsolBalanace = await solanaConnection.getBalance(quoteMintAddress)
            logger.warn(`Trying to unwrap ${wsolBalanace / 10 ** 9} wsol to sol`)
            const instructions = []

            instructions.push(
                createCloseAccountInstruction(
                    quoteMintAddress,
                    wallet.publicKey,
                    wallet.publicKey
                )
            )
            const latestBlockhash = await solanaConnection.getLatestBlockhash({
                commitment: COMMITMENT_LEVEL,
            })

            const messageV0 = new TransactionMessage({
                payerKey: wallet.publicKey,
                recentBlockhash: latestBlockhash.blockhash,
                instructions: [...instructions],
            }).compileToV0Message()

            const transaction = new VersionedTransaction(messageV0)
            transaction.sign([wallet])
            if (jitoMode) {
                if (false) {
                    const result = await jitoWithAxios(transaction, wallet, latestBlockhash)
                } else {
                    const result = await bundle([transaction], wallet)
                }
            } else {
                await execute(transaction, latestBlockhash)
            }
            await sleep(5000)
            const wBal = await solanaConnection.getBalance(quoteMintAddress)
            if (wBal > 0) {
                logger.warn("Unwrapping WSOL failed")
            } else {
                logger.info("Successfully unwrapped WSOL to SOL")
            }
        }
    } catch (error) {
        logger.warn("Error unwrapping WSOL")
    }
}

const priceMatch = async (amountIn: TokenAmount, poolKeys: LiquidityPoolKeysV4) => {
    try {
        const slippage = new Percent(25, 100)

        const tp = Number((Number(solAmount) * (100 + profit) / 100).toFixed(4))
        const sl = Number((Number(solAmount) * (100 - stopLoss) / 100).toFixed(4))
        let timesChecked = 0
        do {
            try {
                const poolInfo = await Liquidity.fetchInfo({
                    connection: solanaConnection,
                    poolKeys,
                })

                const { amountOut } = Liquidity.computeAmountOut({
                    poolKeys,
                    poolInfo,
                    amountIn,
                    currencyOut: quoteToken,
                    slippage,
                })

                // const pnl = Number(amountOut.toFixed(6)) / Number(solAmount) * 100

                logger.info(
                    `Take profit: ${tp} SOL | Stop loss: ${sl} SOL | Buy amount: ${solAmount} SOL | Current: ${amountOut.toFixed(4)} SOL`,
                )
                const amountOutNum = Number(amountOut.toFixed(6))
                if (amountOutNum < sl) {
                    logger.info({ stopLoss: "Token is on stop loss point, will sell with loss" })
                    break
                }

                if (amountOutNum > tp) {
                    logger.info({ takeProfit: "Token is on profit level, will sell with profit" })
                    break
                }
            } catch (e) {
                logger.warn(`Price calculation is unknown, because token account is not confirmed`)
            } finally {
                timesChecked++
            }
            await sleep(200)
        } while (timesChecked < 300)
    } catch (error) {
        logger.warn("Error when setting profit amounts", error)
    }
}

export const runListener = async (io?: Server) => {

    logger.info('Raydium tracking started')

    const raydiumLogId = solanaSubcribeConnection.onLogs(RAYDIUM_LIQUIDITY_PROGRAM_ID_V4, async (Logs) => {
        const { logs, signature, err } = Logs
        const ray_log = lo.find(logs, (y) => y.includes("ray_log"));
        if (!err && ray_log) {
            const match = ray_log.match(/ray_log: (.*)/)
            if (match?.length) {
                const ray_data = Buffer.from(
                    match[1],
                    "base64"
                );
                const log_type = LOG_TYPE.decode(ray_data).log_type;
                if (log_type == RAY_IX_TYPE.CREATE_POOL) {
                    processRaydiumPool(signature)
                }
            }
        }
    })

    const walletSubscriptionId = solanaSubcribeConnection.onLogs(
        wallet.publicKey,
        async (updatedWalletLogs) => {
            const _ = handleWalletUpdated(updatedWalletLogs)
        },
        'confirmed'
    )

    fs.writeFileSync('raydium.json', JSON.stringify({ raydiumLogId, walletSubscriptionId }))
    logger.info(`Listening for raydium changes: ${raydiumLogId}`)
    logger.info(`Listening for wallet changes: ${walletSubscriptionId}`)
    logger.info('----------------------------------------')
    logger.info('Bot is running! Press CTRL + C to stop it.')
    logger.info('----------------------------------------')
}

const watcher = () => {
    try {
        fs.watch('data.json', async () => {
            logger.info('data changed')
            await initListener()
        })
    } catch (e) {
        console.log('raydium watcher\n', e)
    }
}

watcher()