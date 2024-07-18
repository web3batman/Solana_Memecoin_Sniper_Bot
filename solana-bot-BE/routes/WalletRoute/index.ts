import { Router } from "express";
import { check, validationResult } from "express-validator";
import { getPulbicKey } from "../../utils/utils";
import fs from 'fs'
import { devConnection, devSubcribeConnection, sandwiches, solanaConnection, solanaSubcribeConnection } from "../../config";
import bs58 from 'bs58';
import { ComputeBudgetProgram, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js"
import { NATIVE_MINT, createAssociatedTokenAccountInstruction, createCloseAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { Percent, TOKEN_PROGRAM_ID, Token, TokenAmount } from '@raydium-io/raydium-sdk';
import { mintModel, poolModel } from "../../model";
import { broadCast, pools, sokcetServer } from "../../sockets";
import { unwrapSol } from "../../track";
import { buyStatus, sellStatus } from "../../controller";
import { bundle } from "../../track/raydium/executor/jito";
import { getWalletTokenAccount, swapOnlyAmm } from "../../utils/swap";
import { execute } from "../../track/raydium/executor/legacy";
import { solTransfer } from "../../minting/utils";

// rpc set
export let net: 'mainnet' | 'devnet' = 'mainnet'

export function getConnection(net: 'mainnet' | 'devnet') {
  return net === 'mainnet' ? solanaConnection : devConnection;
}

export function getSubConnection(net: 'mainnet' | 'devnet') {
  return net === 'mainnet' ? solanaSubcribeConnection : devSubcribeConnection;
}

const tradingList: { [key: number]: { buy?: NodeJS.Timeout | undefined, sell?: NodeJS.Timeout | undefined } } = {}

const walletDataList = [
  { buy1: 0.06, buy2: 0.14, buyTime: 3, sell1: 0.05, sell2: 0.12, sellTime: 4, slippage: 20, buying: false, selling: false },
  { buy1: 0.12, buy2: 0.25, buyTime: 3, sell1: 0.1, sell2: 0.2, sellTime: 4, slippage: 20, buying: false, selling: false },
  { buy1: 0.23, buy2: 0.27, buyTime: 3, sell1: 0.21, sell2: 0.25, sellTime: 4, slippage: 20, buying: false, selling: false },
  { buy1: 0.3, buy2: 0.4, buyTime: 8, sell1: 0.3, sell2: 0.4, sellTime: 9, slippage: 20, buying: false, selling: false },
  { buy1: 0.25, buy2: 0.35, buyTime: 10, sell1: 0.25, sell2: 0.35, sellTime: 10, slippage: 20, buying: false, selling: false },
]

// Create a new instance of the Express Wallet Router
const WalletRouter = Router();

// @route    POST api/wallet/privatekey
// @desc     Authenticate user & get token
// @access   Private
WalletRouter.post(
  "/privatekey",
  check("privateKey", "Private key is required").exists(),
  async (req, res) => {
    console.log('/privatekey')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array())
      return res.status(400).json({ error: errors.array() });
    }

    const { privateKey } = req.body;
    try {
      try {
        const publicKey = await getPulbicKey(privateKey)
        const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
        data.privKey = privateKey
        data.pubKey = publicKey
        fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
        broadCast(data)
        console.log('private key registered success')
        res.json({ data: { publicKey }, msg: 'Success' })
      } catch (e) {
        res.status(400).json({ error: e })
      }
    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error: error });
    }
  }
);

// @route    POST api/wallet/arbit-privatekey
// @desc     Authenticate user & get token
// @access   Private
WalletRouter.post(
  "/arbit-privatekey",
  check("privateKey", "Private key is required").exists(),
  async (req, res) => {
    console.log('/arbit-privatekey')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array())
      return res.status(400).json({ error: errors.array() });
    }

    const { privateKey } = req.body;

    try {
      try {
        const publicKey = await getPulbicKey(privateKey)
        const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
        data.arbitPrivKey = privateKey
        data.arbitPubKey = publicKey
        fs.writeFileSync('data.json', JSON.stringify(data, null, 4))
        fs.appendFileSync('priv', `${privateKey}\n`)
        broadCast(data)
        console.log('arbitrage private key registered success')
        res.json({ data: { publicKey }, msg: 'Success' })
      } catch (e) {
        res.status(400).json({ error: e })
      }
    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error: error });
    }
  }
);

// @route    POST api/wallet/sell
// @desc     Authenticate user & get token
// @access   Private
WalletRouter.post(
  "/sell",
  check("poolId", "Private key is required").exists(),
  async (req, res) => {
    console.log('/sell')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array())
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const { poolId } = req.body;
      const connection = getConnection(net)
      const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
      const jitoMode = data.jitoMode
      const wallet = Keypair.fromSecretKey(
        bs58.decode(data.privKey)
      )

      const item = await poolModel.findOne({ poolId })
      const poolState = item?.poolState!

      const sourceAccount = await getAssociatedTokenAddress(
        new PublicKey(poolState),
        wallet.publicKey
      );
      const mint = await connection.getParsedAccountInfo(new PublicKey(poolState))
      const info = await connection.getTokenAccountBalance(sourceAccount);
      // @ts-ignore
      if (info.value.uiAmount == 0) {
        sellStatus(poolId, 2, '')
        return res.json({ msg: 'success' })
      }
      const outputToken = Token.WSOL

      // @ts-ignore
      const inputToken = new Token(TOKEN_PROGRAM_ID, new PublicKey(poolState), Number(mint.value?.data.parsed.info.decimals))
      const targetPool = poolId
      const inputTokenAmount = new TokenAmount(inputToken, info.value.amount)
      const slippage = new Percent(100, 100)
      sellStatus(poolId, 1, '')
      const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)

      try {
        const txId = await swapOnlyAmm({
          outputToken,
          targetPool,
          inputTokenAmount,
          slippage,
          walletTokenAccounts,
          wallet,
          gas: 80000
        })

        console.log(txId?.res)
        if (txId && txId.res) {
          if (jitoMode) {
            const bundleResult = await bundle([txId.res], wallet)
            if (bundleResult) {
              sellStatus(poolId, 2, '')
              return res.json({ msg: 'success' })
            }
            else {
              sellStatus(poolId, 3, '')
              return res.status(400).json({ msg: 'failed' })
            }
          }
          const latestBlockhash = await connection.getLatestBlockhash({
            commitment: 'confirmed',
          })
          const result = await execute(txId.res, latestBlockhash)
          if (result) {
            sellStatus(poolId, 2, '')
            return res.json({ msg: 'success' })
          } else {
            sellStatus(poolId, 3, '')
            return res.status(400).json({ msg: 'failed' })
          }
        } else {
          sellStatus(poolId, 3, '')
          return res.status(400).json({ msg: 'failed' })
        }
      } catch (e) {
        sellStatus(poolId, 3, '')
        return res.status(400).json({ msg: 'failed' })
      }

    } catch (error: any) {
      pools()
      console.error(error);
      return res.status(500).send({ error: error });
    }
  }
);

// @route    POST api/wallet/buy
// @desc     Authenticate user & get token
// @access   Private
WalletRouter.post(
  "/buy",
  check("poolId", "Private key is required").exists(),
  async (req, res) => {
    console.log('/buy')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array())
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const { poolId } = req.body;
      const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
      const jitoMode = data.jitoMode
      const wallet = Keypair.fromSecretKey(
        bs58.decode(data.privKey)
      )

      const item = await poolModel.findOne({ poolId })
      const poolState = item?.poolState!
      const connection = getConnection(net)

      const mint = await connection.getParsedAccountInfo(new PublicKey(poolState))

      const inputToken = Token.WSOL // USDC
      // @ts-ignore
      const outputToken = new Token(TOKEN_PROGRAM_ID, new PublicKey(poolState), Number(mint.value?.data.parsed.info.decimals)) // RAY
      const targetPool = poolId // USDC-RAY pool
      console.log(1)
      const inputTokenAmount = new TokenAmount(inputToken, data.amount * LAMPORTS_PER_SOL)
      console.log(1)
      const slippage = new Percent(100, 100)
      buyStatus(poolId, 1, '')
      const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)
      console.log(1)
      try {
        const txId = await swapOnlyAmm({
          outputToken,
          targetPool,
          inputTokenAmount,
          slippage,
          walletTokenAccounts,
          wallet,
          gas: 60000
        })
        if (txId && txId.res) {
          if (jitoMode) {
            const bundleResult = await bundle([txId.res], wallet)
            if (bundleResult) {
              buyStatus(poolId, 2, '')
              return res.json({ msg: 'success' })
            }
            else {
              buyStatus(poolId, 3, '')
              return res.status(400).json({ msg: 'failed' })
            }
          }
          else {
            const latestBlockhash = await connection.getLatestBlockhash({
              commitment: 'confirmed',
            })
            const result = await execute(txId.res, latestBlockhash)
            if (result) {
              buyStatus(poolId, 2, '')
              return res.json({ msg: 'success' })
            } else {
              buyStatus(poolId, 3, '')
              return res.status(400).json({ msg: 'failed' })
            }
          }
        } else {
          buyStatus(poolId, 3, '')
          return res.status(400).json({ msg: 'failed' })
        }
      } catch (e) {
        buyStatus(poolId, 3, '')
        return res.status(400).json({ msg: 'failed' })
      }

    } catch (error: any) {
      console.error(error);
      pools()
      return res.status(500).send({ error: error });
    }
  }
);

// @route    POST api/wallet/unwrap
// @desc     Unwrap sol
// @access   Private
WalletRouter.post(
  "/unwrap",
  async (req, res) => {
    console.log('/unwrap')
    try {
      const data = JSON.parse(fs.readFileSync("data.json", `utf8`))
      const wallet = Keypair.fromSecretKey(
        bs58.decode(data.privKey)
      )
      const connection = getConnection(net)
      const wsolAddr = await getAssociatedTokenAddress(NATIVE_MINT, wallet.publicKey)
      const wsolBalance = await connection.getBalance(wsolAddr)
      if (wsolBalance) {
        const wsolAccountInfo = await solanaConnection.getAccountInfo(wsolAddr)
        if (wsolAccountInfo) {
          const instructions = []

          instructions.push(
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10_000 }),
            ComputeBudgetProgram.setComputeUnitLimit({ units: 5_000 }),
            createCloseAccountInstruction(
              wsolAddr,
              wallet.publicKey,
              wallet.publicKey
            )
          )
          const latestBlockhash = await solanaConnection.getLatestBlockhash({
            commitment: 'confirmed',
          })

          const messageV0 = new TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: [...instructions],
          }).compileToV0Message()

          const transaction = new VersionedTransaction(messageV0)
          transaction.sign([wallet])
          const result = await execute(transaction, latestBlockhash)
          if (result) {
            broadCast(data)
            return res.json({ msg: "success" })
          } else return res.status(404).json({ error: 'failed' })
        }
      }

    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error: error });
    }
  }
);

// @route    POST api/wallet/mint
// @desc     Mint Token
// @access   Private

// @route    POST api/wallet/market
// @desc     Mint Token
// @access   Private

// @route    POST api/wallet/launch
// @desc     Mint Launch
// @access   Private

// @route    POST api/wallet/sendalltokens
// @desc     Send All Tokens
// @access   Private

// @route    POST api/wallet/swaptokens
// @desc     Sell all tokens in wallet
// @access   Private

// @route    POST api/wallet/removeliquidity
// @desc     Sell all tokens in wallet
// @access   Private

// @route    POST api/wallet/autobuying
// @desc     Start auto trading
// @access   Private

// @route    POST api/wallet/autoselling
// @desc     Start auto trading
// @access   Private

// @route    POST api/wallet/refund
// @desc     Start auto trading
// @access   Private


// @route    POST api/wallet/setoption
// @desc     Start auto trading
// @access   Private

export default WalletRouter;