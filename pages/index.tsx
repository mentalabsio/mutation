/** @jsxImportSource theme-ui */
import { Heading, Text, Label } from "@theme-ui/components"

import Header from "@/components/Header/Header"
import NFTSelectInput from "@/components/NFTSelectInput/NFTSelectInput"
import useWalletNFTs from "@/hooks/useWalletNFTs"
import { Button, Flex } from "theme-ui"
import theme from "@/styles/theme"
import { useAnchorWallet } from "@solana/wallet-adapter-react"
import { web3 } from "@project-serum/anchor"

export default function Home() {
  const { walletNFTs } = useWalletNFTs()
  const anchorWallet = useAnchorWallet()
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
          padding: '16px'
        }}
      >
        <Heading mb=".8rem" variant="heading1">
          Mutate your GEN1 NFT into a GEN2 NFT
        </Heading>
        <Text>Burn 1 NFT + 250 $TOKEN</Text>

        <form
          sx={{
            width: "100%",
            marginTop: '4rem'
          }}
          onSubmit={async (e) => {
            e.preventDefault()
            console.log("dasfgsag")

            const data = new FormData(e.currentTarget)

            const mints = data.getAll("mint").filter((val) => val)

            if (!anchorWallet?.publicKey) return true

            console.log(mints)
            if (mints.length !== 1) return true

            // const res = await initializeAndTerminateBreeding(
            //   new web3.PublicKey(mints[0]),
            //   new web3.PublicKey(mints[1])
            // )

            // await fetchNFTs()

            // const res = await useMutation(
            //   new web3.PublicKey('mint1'),
            //   new web3.PublicKey('mint2')
            // )

            return true
          }}
        >
          <Flex
            sx={{
              flexDirection: "column",
              alignItems: "center",
              width: '100%'
            }}
          >
            <Flex
              sx={{
                flexDirection: "column",
                alignItems: "center",
                width: '100%',

                "@media screen and (min-width:768px)": {
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
              }}
            >
              <Label
                sx={{
                  flexDirection: "column",
                  maxWidth: '24rem'
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
                  fontSize: '26px'
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
