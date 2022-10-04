import {NextApiRequest, NextApiResponse} from 'next'
import {Connection} from "@solana/web3.js";
import {keypairIdentity, Metaplex} from "@metaplex-foundation/js"
import {PublicKey} from "@solana/web3.js"
import {AccountLayout} from '@solana/spl-token';
import {getEnvClusterUrl} from 'utils/getEnvClusterUrl';
import readKeypairFromPath from 'utils/readKeypairFromPath';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const connection = new Connection(getEnvClusterUrl());
	const delegate = readKeypairFromPath('delegate.json');

	try {
		const tokenAccount = await connection.getAccountInfo(
			new PublicKey(req.query.ata)
		);
		const {owner, mint} = AccountLayout.decode(tokenAccount.data);

		const {response} = await Metaplex
			.make(connection)
			.use(keypairIdentity(delegate))
			.nfts()
			.freezeDelegatedNft({
				mintAddress: mint,
				tokenOwner: owner,
				delegateAuthority: delegate,
			})
			.run();

		return res
			.status(200)
			.json({
				status: "Ok",
				data: response.signature
			})
	} catch (err) {
		return res
			.status(400)
			.json({
				status: "Error: " + err,
				data: null,
			});
	}
}

export default handler
