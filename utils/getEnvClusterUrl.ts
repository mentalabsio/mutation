export const clustersUrl = {
  "mainnet-beta": process.env.NEXT_PUBLIC_SOLANA_RPC_HOST_MAINNET_BETA,
  devnet: process.env.NEXT_PUBLIC_SOLANA_RPC_HOST_DEVNET,
  localnet: "http://localhost:8899",
}

export const getEnvClusterUrl = () =>
  clustersUrl[process.env.NEXT_PUBLIC_CONNECTION_NETWORK]
