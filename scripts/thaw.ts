#!/usr/bin/env -S npx ts-node -T --skip-project
import * as dotenv from "dotenv";
dotenv.config();
import {Connection, PublicKey} from "@solana/web3.js"
import {keypairIdentity, Metaplex} from "@metaplex-foundation/js"
import {AccountLayout} from "@solana/spl-token";
import {getEnvClusterUrl} from "../utils/getEnvClusterUrl";
import readKeypairFromPath from "utils/readKeypairFromPath";

(async () => {
	const connection = new Connection(getEnvClusterUrl());
	const delegateKeypair = readKeypairFromPath('delegate.json');
	const metaplex = new Metaplex(connection).use(
		keypairIdentity(delegateKeypair)
	)

	// TODO: make this more dynamic (cli args or smth)
	const accounts = [
		new PublicKey("CzqJFoKG3LXv23JHKaW5ESZZZ2outshhVw8mr18DHgVV"),
	]

	try {
		await Promise.all(accounts.map(async (ata, i) => {
			const tokenAccount = await connection.getAccountInfo(ata);
			const {owner, mint} = AccountLayout.decode(tokenAccount.data);

			const {response} = await metaplex.nfts()
				.thawDelegatedNft({
					mintAddress: mint,
					tokenOwner: owner,
					delegateAuthority: delegateKeypair,
				})
				.run()

			console.log(
				`Signature [${i}/${accounts.length}]:`,
				response.signature
			);
		}));
	} catch (err) {
		console.error(err.toString());
	}
})();
