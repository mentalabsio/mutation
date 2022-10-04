#!/usr/bin/env -S npx ts-node -T --skip-project
import * as dotenv from "dotenv";
import {Connection, Keypair, PublicKey} from "@solana/web3.js"
import {keypairIdentity, Metaplex} from "@metaplex-foundation/js"
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {AccountLayout} from "@solana/spl-token";

dotenv.config();

const CLUSTER_URL = {
	"mainnet-beta": process.env.NEXT_PUBLIC_SOLANA_RPC_HOST_MAINNET_BETA,
	"devnet": process.env.NEXT_PUBLIC_SOLANA_RPC_HOST_DEVNET,
	"localnet": "http://localhost:8899",
};

const handler = async () => {
	const cluster = process.env.NEXT_PUBLIC_CONNECTION_NETWORK
	const connection = new Connection(CLUSTER_URL[cluster] || CLUSTER_URL.devnet);

	const secretKey = JSON.parse(
		readFileSync(
			resolve('delegate.json'),
			{encoding: 'utf8'}
		)
	);
	const delegate = Keypair.fromSecretKey(Uint8Array.from(secretKey));

	const ata = new PublicKey("CzqJFoKG3LXv23JHKaW5ESZZZ2outshhVw8mr18DHgVV")
	const tokenAccount = await connection.getAccountInfo(ata);
	const {owner, mint} = AccountLayout.decode(tokenAccount.data);

	try {
		await Metaplex
			.make(connection)
			.use(keypairIdentity(delegate))
			.nfts()
			.thawDelegatedNft({
				mintAddress: mint,
				tokenOwner: owner,
				delegateAuthority: delegate,
			})
			.run();
	} catch (err) {
		console.log(err);
	}
}

handler().then(() => console.log("Done."));

