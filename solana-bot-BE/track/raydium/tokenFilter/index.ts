import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { getPdaMetadataKey } from '@raydium-io/raydium-sdk';

import { MintLayout } from '@solana/spl-token';

export const checkBurn = async (connection: Connection, lpMint: PublicKey, commitment: Commitment) => {
  try {
    const amount = await connection.getTokenSupply(lpMint, commitment);
    const burned = amount.value.uiAmount === 0;
    return burned
  } catch (error) {
    return false
  }
}

// export const checkMutable = async (connection: Connection, baseMint: PublicKey, ) => {
//   try {
//     const metadataPDA = getPdaMetadataKey(baseMint);
//     const metadataAccount = await connection.getAccountInfo(metadataPDA.publicKey);
//     if (!metadataAccount?.data) {
//       return { ok: false, message: 'Mutable -> Failed to fetch account data' };
//     }
//     const serializer = getMetadataAccountDataSerializer()
//     const deserialize = serializer.deserialize(metadataAccount.data);
//     const mutable = deserialize[0].isMutable;

//     return !mutable
//   } catch (e: any) {
//     return false
//   }
// }

export const checkMintable = async (connection: Connection, vault: PublicKey): Promise<boolean | undefined> => {
  try {
    let { data } = (await connection.getAccountInfo(vault)) || {}
    if (!data) {
      return
    }
    const deserialize = MintLayout.decode(data)
    return deserialize.mintAuthorityOption === 0
  } catch (e) {
    return false
  }
}

export const checkFreezable = async (connection: Connection, vault: PublicKey): Promise<boolean | undefined> => {
  try {
    let { data } = (await connection.getAccountInfo(vault)) || {}
    if (!data) {
      return
    }
    const deserialize = MintLayout.decode(data)
    return deserialize.freezeAuthorityOption === 0
  } catch (e) {
    return false
  }
}
