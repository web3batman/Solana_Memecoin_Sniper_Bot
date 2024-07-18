import { VersionedTransaction } from '@solana/web3.js';
import { solanaConnection } from "../../../config";
import { logger } from "../../../utils";


interface Blockhash {
  blockhash: string;
  lastValidBlockHeight: number;
}

export const execute = async (transaction: VersionedTransaction, latestBlockhash: Blockhash) => {
  try {
    const simRes = await solanaConnection.simulateTransaction(transaction)
    // console.log(simRes)
    if (simRes.value.err) {
      console.log('sim err')
      return false
    }

    const signature = await solanaConnection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: true,
    })

    console.log('signature', signature)
    logger.debug({ signature }, 'Confirming transaction...');

    const confirmation = await solanaConnection.confirmTransaction(
      signature,
      'confirmed',
    );

    console.log('confirmation result\n', confirmation)

    if (confirmation.value.err) {
      console.log('tx error')
      return false
    }
    else {
      console.log('tx success')
      return true
    }
  } catch (e) {
    console.log('error', e)
    return false
  }
}
