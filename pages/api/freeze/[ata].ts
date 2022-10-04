import {NextApiRequest, NextApiResponse} from 'next'
import {Connection, Keypair} from "@solana/web3.js";
import {keypairIdentity, Metaplex} from "@metaplex-foundation/js"
import {PublicKey} from "@solana/web3.js"
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {AccountLayout} from '@solana/spl-token';

const CLUSTER_URL = {
	"mainnet-beta": process.env.NEXT_PUBLIC_SOLANA_RPC_HOST_MAINNET_BETA,
	"devnet": process.env.NEXT_PUBLIC_SOLANA_RPC_HOST_DEVNET,
	"localnet": "http://localhost:8899",
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const cluster = process.env.NEXT_PUBLIC_CONNECTION_NETWORK
	const connection = new Connection(CLUSTER_URL[cluster] || CLUSTER_URL.devnet);
	const secretKey = JSON.parse(
		readFileSync(
			resolve('delegate.json'),
			{encoding: 'utf8'}
		)
	);
	const delegate = Keypair.fromSecretKey(Uint8Array.from(secretKey));

	try {
		const tokenAccount = await connection.getAccountInfo(new PublicKey(req.query.ata));
		const {owner, mint} = AccountLayout.decode(tokenAccount.data);

		const txSig = await Metaplex
			.make(connection)
			.use(keypairIdentity(delegate))
			.nfts()
			.freezeDelegatedNft({
				mintAddress: mint,
				tokenOwner: owner,
				delegateAuthority: delegate,
			})
			.run();
		return res.status(200).json({status: "Ok", data: txSig})
	} catch (err) {
		return res.status(400).json({
			status: "Error: could not freeze delegated NFT." + err,
			data: null,
		});
	}
}

export default handler
