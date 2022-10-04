import {findAssociatedTokenAccountPda} from "@metaplex-foundation/js";
import {createApproveInstruction} from "@solana/spl-token";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {PublicKey, Transaction} from "@solana/web3.js";
import {useCallback} from "react";

const delegate =
  new PublicKey("8x3MLK1raj1MfcyDCE1uE66Yo9crF83SjHMWJox3pcwQ");

const useFreezeNFT = () => {
  const {connection} = useConnection();
  const {publicKey: owner, signTransaction} = useWallet();

  const approveDelegate = useCallback(
    async (mintAddress: PublicKey) => {
      const ownerAta = findAssociatedTokenAccountPda(mintAddress, owner);
      const {blockhash, lastValidBlockHeight} =
        await connection.getLatestBlockhash();
      const ix = createApproveInstruction(ownerAta, delegate, owner, 1);
      const tx = new Transaction();
      tx.add(ix);
      tx.feePayer = owner;
      tx.recentBlockhash = blockhash;
      const signedTx = await signTransaction(tx);
      const approveSig = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      await connection.confirmTransaction(
        {blockhash, lastValidBlockHeight, signature: approveSig},
        "finalized"
      );

      return approveSig;
    },
    [connection, owner, signTransaction]
  );

  const freezeDelegatedAccount = useCallback(async (mintAddress: PublicKey) => {
    const ownerAta = findAssociatedTokenAccountPda(mintAddress, owner);
    const res = await fetch(`/api/freeze/${ownerAta}`)
    const {status, data: freezeSig} = await res.json();
    if (res.status !== 200) throw new Error(status);
    return freezeSig;
  }, [owner]);

  const approveAndFreezeNFT = useCallback(async (mintAddress: PublicKey) => {
    const approveSig = await approveDelegate(mintAddress);
    const freezeSig = await freezeDelegatedAccount(mintAddress);
    return [approveSig, freezeSig];
  }, [approveDelegate, freezeDelegatedAccount]);

  return {approveAndFreezeNFT}
}

export default useFreezeNFT;
