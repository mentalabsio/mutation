import { findAssociatedTokenAccountPda } from "@metaplex-foundation/js"
import { createApproveInstruction } from "@solana/spl-token"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import { useCallback } from "react"

const delegate = new PublicKey("8x3MLK1raj1MfcyDCE1uE66Yo9crF83SjHMWJox3pcwQ")

const useFreezeNFT = () => {
  const { connection } = useConnection()
  const { publicKey: owner, sendTransaction } = useWallet()

  const approveAndFreezeNFT = useCallback(
    async (mintAddress: PublicKey) => {
      const ownerAta = findAssociatedTokenAccountPda(mintAddress, owner)
      // Create and run approve instruction.
      const ix = createApproveInstruction(ownerAta, delegate, owner, 1)
      const tx = new Transaction().add(ix)
      const approveSig = await sendTransaction(tx, connection)
      // Validate the transaction data and run freezeDelegatedNFT task using the API.
      const res = await fetch(`/api/freeze/${ownerAta}?tx=${approveSig}`)
      const { status, data: freezeSig } = await res.json()
      if (res.status !== 200) throw new Error(status)
      return [approveSig, freezeSig]
    },
    [connection, owner, sendTransaction]
  )

  return { approveAndFreezeNFT }
}

export default useFreezeNFT
