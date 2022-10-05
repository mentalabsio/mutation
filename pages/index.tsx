/** @jsxImportSource theme-ui */
import { Heading, Text, Label } from "@theme-ui/components"

import Header from "@/components/Header/Header"
import NFTSelectInput from "@/components/NFTSelectInput/NFTSelectInput"
import useWalletNFTs from "@/hooks/useWalletNFTs"
import { Button, Flex } from "theme-ui"
import theme from "@/styles/theme"
import { useAnchorWallet } from "@solana/wallet-adapter-react"
import useFreezeNFT from "@/hooks/useFreezeNFT"
import { PublicKey } from "@solana/web3.js"

export default function Home() {
  const { walletNFTs } = useWalletNFTs()
  const anchorWallet = useAnchorWallet()
  const { approveAndFreezeNFT } = useFreezeNFT()
  return (
    <>
      <Header />
      <main
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "64rem",
          margin: "0 auto",
          marginTop: "4rem",
          padding: "16px",
        }}
      >
        <Heading mb=".8rem" variant="heading1">
          Mutate your GEN1 NFT into a GEN2 NFT
        </Heading>
        <Text>Burn 1 NFT + 250 $TOKEN</Text>

        <form
          sx={{
            width: "100%",
            marginTop: "4rem",
          }}
          onSubmit={async (e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            const [mint] = data.getAll("mint").filter((val) => val)
            if (!anchorWallet?.publicKey || !mint) return true

            try {
              const mintAddress = new PublicKey(mint)
              const [approveSig, freezeSig] = await approveAndFreezeNFT(
                mintAddress
              )

              console.log("Approve tx:", approveSig)
              console.log("Freeze tx:", freezeSig)
            } catch (err) {
              console.log(err)
            }
            return true
          }}
        >
          <Flex
            sx={{
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Flex
              sx={{
                flexDirection: "column",
                alignItems: "center",
                width: "100%",

                "@media screen and (min-width:768px)": {
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
              }}
            >
              <Label
                sx={{
                  flexDirection: "column",
                  maxWidth: "24rem",
                }}
              >
                Select your NFT:
                <NFTSelectInput name="mint" NFTs={walletNFTs} />
              </Label>
              <Text
                sx={{
                  fontSize: "100px",
                }}
              >
                +
              </Text>
              <Text
                sx={{
                  marginTop: "10px",
                  fontSize: "26px",
                }}
              >
                250 $TOKEN
              </Text>
            </Flex>
            <Button
              type="submit"
              sx={{
                marginTop: "40px",
                color: (t) =>
                  t.rawColors?.text === theme.colors.text
                    ? "background"
                    : "text",
              }}
            >
              Mutate
            </Button>
          </Flex>
        </form>
      </main>
    </>
  )
}
