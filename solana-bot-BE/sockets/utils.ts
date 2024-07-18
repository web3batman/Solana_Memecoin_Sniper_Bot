import { Connection, PublicKey } from "@solana/web3.js";
import { solanaConnection } from "../config";
import { Liquidity, MARKET_STATE_LAYOUT_V3, SPL_ACCOUNT_LAYOUT, TokenAccount, WSOL } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Commitment } from "@solana/web3.js";

const getPoolId = async (connection: Connection, baseMint: PublicKey, quoteMint: PublicKey): Promise<PublicKey> => {

    const generateV4PoolInfo = async (baseMint: PublicKey, quoteMint: PublicKey, marketID: PublicKey) => {
        const poolInfo = Liquidity.getAssociatedPoolKeys({
            version: 4,
            marketVersion: 3,
            baseMint: baseMint,
            quoteMint: quoteMint,
            baseDecimals: 0,
            quoteDecimals: 9,
            programId: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
            marketId: marketID,
            marketProgramId: new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),
        });
        return { poolInfo }
    }

    const fetchMarketId = async (connection: Connection, baseMint: PublicKey, quoteMint: PublicKey, commitment: Commitment) => {
        const accounts = await connection.getProgramAccounts(
            new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),
            {
                commitment,
                filters: [
                    { dataSize: MARKET_STATE_LAYOUT_V3.span },
                    {
                        memcmp: {
                            offset: MARKET_STATE_LAYOUT_V3.offsetOf("baseMint"),
                            bytes: baseMint.toBase58(),
                        },
                    },
                    {
                        memcmp: {
                            offset: MARKET_STATE_LAYOUT_V3.offsetOf("quoteMint"),
                            bytes: quoteMint.toBase58(),
                        },
                    },
                ],
            }
        );
        return accounts.map(({ account }) => MARKET_STATE_LAYOUT_V3.decode(account.data))[0].ownAddress
    }

    const marketId = await fetchMarketId(connection, baseMint, quoteMint, 'confirmed')
    const V4PoolInfo = await generateV4PoolInfo(baseMint, quoteMint, marketId)
    return V4PoolInfo.poolInfo.id
}

const waitFor = (delay: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, delay));
};

export const walletTokenList = async (pubkey: string) => {
    const tokenList: Array<{ mint: string, ata: string, balance: number }> = []

    try {
        const publicKey = new PublicKey(pubkey)

        const walletTokenAccount = await solanaConnection.getTokenAccountsByOwner(publicKey, {
            programId: TOKEN_PROGRAM_ID
        });
        const tokenAccounts: TokenAccount[] = walletTokenAccount.value.map((j) => ({
            pubkey: j.pubkey,
            programId: j.account.owner,
            accountInfo: SPL_ACCOUNT_LAYOUT.decode(j.account.data)
        }))

        // for (let i = 0; i < tokenAccounts.length; i++) {
        //     const bal = await solanaConnection.getTokenAccountBalance(tokenAccounts[i].pubkey)
        //     if (bal.value.uiAmount && bal.value.uiAmount > 0) {
        //         const poolId = await getPoolId(solanaConnection, tokenAccounts[i].accountInfo.mint, new PublicKey(WSOL.mint))
        //         tokenList.push({ mint: tokenAccounts[i].accountInfo.mint.toString(), ata: tokenAccounts[i].pubkey.toString(), balance: bal.value.uiAmount })
        //     }
        //     waitFor(500)
        // }

        return tokenAccounts
    } catch (e) {
        console.log(e)
        return []
    }
}