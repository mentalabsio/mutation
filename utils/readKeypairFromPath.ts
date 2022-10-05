import { Keypair } from "@solana/web3.js"
import { readFileSync } from "fs"

export function readKeypairFromPath(path: string) {
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(readFileSync(path, { encoding: "utf8" })))
  )
}
