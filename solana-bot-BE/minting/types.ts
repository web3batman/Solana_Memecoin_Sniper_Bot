import { web3 } from "@project-serum/anchor"
import { Percent } from "@raydium-io/raydium-sdk"
import { PublicKey } from "@solana/web3.js"
import { Keypair } from "@solana/web3.js"

export type CreateTokenInput = {
    keypair:web3.Keypair
    name: string,
    symbol?: string,
    image?: string
    website?: string
    twitter?: string
    telegram?: string
    description?: string
    decimals: number
    url: 'mainnet' | 'devnet',
    metaUri: string,
    initialMintingAmount: number
    revokeAuthorities?: boolean
}

export type FreezeAccounInput = {
    url: 'mainnet' | 'devnet',
    metaUri: string,
    owner: web3.PublicKey,
}

export type SolTransferInput = {
    url: 'mainnet' | 'devnet',
    from: Keypair,
    to: Keypair
}

export type CreateMarketInput = {
    keypair:web3.Keypair
    baseMint: web3.PublicKey,
    quoteMint: web3.PublicKey,
    orderSize: number,
    priceTick: number,
    url: 'mainnet' | 'devnet',
}
export type AddLiquidityInput = {
    slippage: Percent,
    poolId: web3.PublicKey,
    amount: number,
    amountSide: 'base' | 'quote',
    url: 'mainnet' | 'devnet',
}
export type RemoveLiquidityInput = {
    keypair:web3.Keypair,
    poolId: web3.PublicKey,
    amount: number,
    url: 'mainnet' | 'devnet',
    unwrapSol?: boolean
}

export type CreatePoolInput = {
    keypair:web3.Keypair,
    marketId: web3.PublicKey,
    baseMintAmount: number,
    quoteMintAmount: number,
    url: 'mainnet' | 'devnet',
}

export type CreatePoolInputAndProvide = {
    keypair:web3.Keypair,
    marketId: web3.PublicKey
    baseMintAmount: number
    quoteMintAmount: number
    wallets: Array<{ pubkey: string, secretkey: string }>
    minAmount: number
    maxAmount: number
    isBurned: boolean
    url: 'mainnet' | 'devnet'
}

export type SwapInput = {
    keypair: Keypair
    poolId: web3.PublicKey
    buyToken: "base" | 'quote',
    sellToken?: 'base' | 'quote',
    amountSide: "send" | 'receive',
    amount: number,
    slippage: Percent,
    url: 'mainnet' | 'devnet',
}

export type CreateAndBuy = {
    //pool
    marketId: web3.PublicKey,
    baseMintAmount: number,
    quoteMintAmount: number,
    url: 'mainnet' | 'devnet',

    //buy
    buyToken: 'base' | 'quote',
    buyAmount: number
}

export type BundleRes = {
    uuid: string;
    timestamp: string;
    validatorIdentity: string;
    transactions: string[];
    slot: number;
    status: number;
    landedTipLamports: number;
    signer: string;
    __typename: string;
}