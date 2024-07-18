import { ApiPoolInfoV4, InnerSimpleV0Transaction, LIQUIDITY_STATE_LAYOUT_V4, LOOKUP_TABLE_CACHE, Liquidity, LiquidityPoolKeys, MARKET_STATE_LAYOUT_V3, Market, Percent, SPL_ACCOUNT_LAYOUT, SPL_MINT_LAYOUT, Token, TokenAccount, TokenAmount, TxVersion, buildSimpleTransaction, jsonInfo2PoolKeys } from "@raydium-io/raydium-sdk"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { Connection, PublicKey, Signer, Transaction } from "@solana/web3.js"
import { Keypair } from "@solana/web3.js"
import { solanaConnection } from '../config/config';
import { SendOptions } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { AccountInfo } from "@solana/web3.js";

type WalletTokenAccounts = Awaited<ReturnType<typeof getWalletTokenAccount>>
type TestTxInputInfo = {
    outputToken: Token
    targetPool: string
    inputTokenAmount: TokenAmount
    slippage: Percent
    walletTokenAccounts: WalletTokenAccounts
    wallet: Keypair,
    gas?: number,
}

const makeTxVersion = TxVersion.V0;
const addLookupTableInfo = LOOKUP_TABLE_CACHE

export async function getWalletTokenAccount(connection: Connection, wallet: PublicKey): Promise<TokenAccount[]> {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID,
    });
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
}

async function sendTx(
    connection: Connection,
    payer: Keypair | Signer,
    txs: (VersionedTransaction | Transaction)[],
    options?: SendOptions
): Promise<VersionedTransaction | undefined> {
    console.log('length', txs.length)
    for (const iTx of txs) {
        if (iTx instanceof VersionedTransaction) {
            iTx.sign([payer]);
            // txids.push(await connection.sendTransaction(iTx, options));
            // const simulator = await connection.simulateTransaction(iTx)
            // console.log(simulator)
            // const rawTransaction = iTx.serialize()
            // const txid = await connection.sendRawTransaction(rawTransaction, {
            //     skipPreflight: true,
            //     maxRetries: 2
            // });
            return iTx
        }
        else {
            return undefined
        }
    }

    return undefined
}

export async function buildAndSendTx(innerSimpleV0Transaction: InnerSimpleV0Transaction[], wallet: Keypair, options?: SendOptions) {
    const willSendTx = await buildSimpleTransaction({
        connection: solanaConnection,
        makeTxVersion,
        payer: wallet.publicKey,
        innerTransactions: innerSimpleV0Transaction,
        addLookupTableInfo,
    })

    const res = await sendTx(solanaConnection, wallet, willSendTx, options)
    return res
}


export const formatAmmKeysById = async (id: string): Promise<ApiPoolInfoV4 | undefined> => {
    try {
        let account: AccountInfo<Buffer> | null = null
        while (account === null) account = await solanaConnection.getAccountInfo(new PublicKey(id))
        const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data)

        const marketId = info.marketId
        let marketAccount: AccountInfo<Buffer> | null = null
        while (marketAccount === null) marketAccount = await solanaConnection.getAccountInfo(marketId)
        if (marketAccount === null) throw Error(' get market info error')
        const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data)

        const lpMint = info.lpMint
        let lpMintAccount: AccountInfo<Buffer> | null = null
        while (lpMintAccount === null) lpMintAccount = await solanaConnection.getAccountInfo(lpMint, 'processed')
        const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data)

        return {
            id,
            baseMint: info.baseMint.toString(),
            quoteMint: info.quoteMint.toString(),
            lpMint: info.lpMint.toString(),
            baseDecimals: info.baseDecimal.toNumber(),
            quoteDecimals: info.quoteDecimal.toNumber(),
            lpDecimals: lpMintInfo.decimals,
            version: 4,
            programId: account.owner.toString(),
            authority: Liquidity.getAssociatedAuthority({ programId: account.owner }).publicKey.toString(),
            openOrders: info.openOrders.toString(),
            targetOrders: info.targetOrders.toString(),
            baseVault: info.baseVault.toString(),
            quoteVault: info.quoteVault.toString(),
            withdrawQueue: info.withdrawQueue.toString(),
            lpVault: info.lpVault.toString(),
            marketVersion: 3,
            marketProgramId: info.marketProgramId.toString(),
            marketId: info.marketId.toString(),
            marketAuthority: Market.getAssociatedAuthority({ programId: info.marketProgramId, marketId: info.marketId }).publicKey.toString(),
            marketBaseVault: marketInfo.baseVault.toString(),
            marketQuoteVault: marketInfo.quoteVault.toString(),
            marketBids: marketInfo.bids.toString(),
            marketAsks: marketInfo.asks.toString(),
            marketEventQueue: marketInfo.eventQueue.toString(),
            lookupTableAccount: PublicKey.default.toString()
        }
    } catch (e) {
        console.log(e)
    }
}

export async function swapOnlyAmm(input: TestTxInputInfo) {
    try {
        // -------- pre-action: get pool info --------
        const targetPoolInfo = await formatAmmKeysById(input.targetPool)
        const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys
        const poolInfo = await Liquidity.fetchInfo({ connection: solanaConnection, poolKeys })
        // -------- step 1: coumpute amount out --------
        const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
            poolKeys,
            poolInfo,
            amountIn: input.inputTokenAmount,
            currencyOut: input.outputToken,
            slippage: input.slippage,
        })

        // -------- step 2: create instructions by SDK function --------
        if (!input.gas) {
            const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
                connection: solanaConnection,
                poolKeys,
                userKeys: {
                    tokenAccounts: input.walletTokenAccounts,
                    owner: input.wallet.publicKey,
                },
                amountIn: input.inputTokenAmount,
                amountOut: minAmountOut,
                fixedSide: 'in',
                makeTxVersion,
                computeBudgetConfig: {
                    units: 100_000,
                    microLamports: 200_000
                }
            })
            console.log('amountOut:', amountOut.toFixed(), '  minAmountOut: ', minAmountOut.toFixed())

            const res = await buildAndSendTx(innerTransactions, input.wallet)
            return { res, innerTransactions }
        } else {
            const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
                connection: solanaConnection,
                poolKeys,
                userKeys: {
                    tokenAccounts: input.walletTokenAccounts,
                    owner: input.wallet.publicKey,
                },
                amountIn: input.inputTokenAmount,
                amountOut: minAmountOut,
                fixedSide: 'in',
                makeTxVersion,
                computeBudgetConfig: {
                    units: 100_000,
                    microLamports: 200_000
                }
            })
            console.log('amountOut:', amountOut.toFixed(), '  minAmountOut: ', minAmountOut.toFixed())

            const res = await buildAndSendTx(innerTransactions, input.wallet)
            return { res, innerTransactions }
        }
    }
    catch (e) {
        console.log(e)
        return undefined
    }
}
