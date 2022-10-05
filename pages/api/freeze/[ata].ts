import { NextApiRequest, NextApiResponse } from "next"
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js"
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js"
import {
  AccountLayout,
  decodeApproveInstruction,
  isApproveInstruction,
} from "@solana/spl-token"
import { getEnvClusterUrl } from "utils/getEnvClusterUrl"
import { readKeypairFromPath } from "utils/readKeypairFromPath"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const connection = new Connection(getEnvClusterUrl(), "confirmed")
  const delegate = readKeypairFromPath("delegate.json")

  try {
    const tx = req.query.tx.toString()
    const { transaction } = await connection.getTransaction(tx, {
      maxSupportedTransactionVersion: 0,
    })
    // Make sure that the transaction consists exclusively of ApproveInstructions
    // where the delegate address matches the public key in the keypair file.
    if (
      !transaction.message.compiledInstructions.every(
        ({ accountKeyIndexes, data, programIdIndex }) => {
          const decoded = decodeApproveInstruction(
            new TransactionInstruction({
              keys: accountKeyIndexes.map((i) => ({
                pubkey: transaction.message.staticAccountKeys[i],
                isSigner: transaction.message.isAccountSigner(i),
                isWritable: transaction.message.isAccountWritable(i),
              })),
              programId: transaction.message.staticAccountKeys[programIdIndex],
              data: Buffer.from(data),
            })
          )
          return (
            isApproveInstruction(decoded) &&
            decoded.keys.delegate.pubkey.equals(delegate.publicKey)
          )
        }
      )
    )
      throw new Error("Invalid ApproveInstruction found in transaction data.")

    const tokenAccount = await connection.getAccountInfo(
      new PublicKey(req.query.ata)
    )
    const { owner, mint } = AccountLayout.decode(tokenAccount.data)
    const { response } = await Metaplex.make(connection)
      .use(keypairIdentity(delegate))
      .nfts()
      .freezeDelegatedNft({
        mintAddress: mint,
        tokenOwner: owner,
        delegateAuthority: delegate,
      })
      .run()

    return res.status(200).json({
      status: "Ok",
      data: response.signature,
    })
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      status: "Failed to freeze delegated NFT: " + err,
      data: null,
    })
  }
}

export default handler
