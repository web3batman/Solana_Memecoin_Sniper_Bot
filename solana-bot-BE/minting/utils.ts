import { web3 } from "@project-serum/anchor"
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes"
import { Percent, publicKey } from '@raydium-io/raydium-sdk';
import Axios from "axios"
import { config } from "dotenv"
import { ENV } from "./constants"
import { PublicKey } from "@metaplex-foundation/js"
import { SolTransferInput } from './types';
import { devConnection, solanaConnection } from "../config"
import { ComputeBudgetProgram, Transaction } from "@solana/web3.js"
import { SystemProgram } from "@solana/web3.js"

config()

const log = console.log;

export function calcNonDecimalValue(value: number, decimals: number): number {
  return Math.trunc(value * (Math.pow(10, decimals)))
}

export function calcDecimalValue(value: number, decimals: number): number {
  return value / (Math.pow(10, decimals))
}

export function getKeypairFromStr(str: string): web3.Keypair | null {
  try {
    return web3.Keypair.fromSecretKey(Uint8Array.from(bs58.decode(str)))
  } catch (error) {
    return null
  }
}

export async function getNullableResutFromPromise<T>(value: Promise<T>, opt?: { or?: T, logError?: boolean }): Promise<T | null> {
  return value.catch((error) => {
    if (opt) console.log({ error })
    return opt?.or != undefined ? opt.or : null
  })
}

export function getSlippage(value?: number) {
  try {
    const slippageVal = value ?? 0
    let denominator = (slippageVal.toString().split('.')[1] ?? "").length
    denominator = 10 ** denominator
    const number = slippageVal * denominator
    denominator = denominator * 100
    const slippage = new Percent(number, denominator)
    return slippage
  } catch (error) {
    throw "failed to parse slippage input"
  }
}

export function getKeypairFromEnv() {
  const keypairStr = process.env.KEYPAIR ?? ""
  try {
    const keypair = getKeypairFromStr(keypairStr)
    if (!keypair) throw "keypair not found"
    return keypair
  } catch (error) {
    console.log({ error })
    throw "Keypair Not Found"
  }
}

export async function deployJsonData(data: any): Promise<string | null> {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const pinataApiKey = ENV.PINATA_API_kEY
  const pinataSecretApiKey = ENV.PINATA_API_SECRET_KEY
  // console.log({pinataApiKey, pinataSecretApiKey})
  return Axios.post(url,
    data,
    {
      headers: {
        'Content-Type': `application/json`,
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey
      }
    }
  ).then(function (response: any) {
    return response?.data?.IpfsHash;
  }).catch(function (error: any) {
    console.log({ jsonUploadErr: error })
    return null
  });
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export function getPubkeyFromStr(str?: string) {
  try {
    return new web3.PublicKey((str ?? "").trim())
  } catch (error) {
    return null
  }
}

export async function sendAndConfirmTransaction(tx: web3.VersionedTransaction | web3.Transaction, connection: web3.Connection) {
  const rawTx = tx.serialize()
  const txSignature = (await web3.sendAndConfirmRawTransaction(connection, Buffer.from(rawTx), { commitment: 'confirmed', skipPreflight: true })
    .catch(async () => {
      await sleep(500)
      return await web3.sendAndConfirmRawTransaction(connection, Buffer.from(rawTx), { commitment: 'confirmed', skipPreflight: true })
        .catch((txError) => {
          log({ txError })
          return null
        })
    }))
  return txSignature
}

export const solTransfer = async (input: SolTransferInput) => {
  const { url, from, to } = input
  const connection = input.url == 'mainnet' ? solanaConnection : devConnection
  const amount = await connection.getBalance(from.publicKey)
  const tx = new Transaction();

  if (amount == 0) return { Err: 'No amount' }

  const updateCPIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000_000 })
  const updateCLIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 10_000 })

  tx.add(
    updateCPIx,
    updateCLIx,
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: amount
    }
    )
  );

  const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.recentBlockhash = recentBlockhash
  tx.feePayer = to.publicKey
  tx.sign(from, to)

  const txSignature = (await sendAndConfirmTransaction(tx, connection)
    .catch(async () => {
      console.log("closes account failed")
      await sleep(500)
      console.log("sending remove liq tx2")
      return await sendAndConfirmTransaction(tx, connection)
        .catch((error) => {
          log({ error })
          return null
        })
    }))

  return txSignature ? { Ok: txSignature } : { Err: 'Tx failed' }
}