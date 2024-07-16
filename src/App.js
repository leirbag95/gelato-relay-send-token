import { useState } from "react";
import "./App.css";
import { encodeFunctionData } from 'viem';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { ethers } from 'ethers'
import { CONTRACT_ABI, TOKEN_ABI } from "./utils/abi.ts";
import { REACT_APP_TOKEN_ADDRESS, REACT_APP_CONTRACT_ADDRESS } from "./utils/address.ts";

const tokenAddress = REACT_APP_TOKEN_ADDRESS
const permitContractAddress = REACT_APP_CONTRACT_ADDRESS
const abi = CONTRACT_ABI
const myTokenAbi = TOKEN_ABI

function App() {
	const { ready, authenticated, user, login, logout } = usePrivy();
	const { wallets } = useWallets()
	const [apiKey, setApiKey] = useState("QHwi_k_YbdrfCOkTaRTNtx0bJWwhS0Hf_iJdT0mDd1E_");
	const [signer, setSigner] = useState(null);
	const [provider, setProvider] = useState(null);
	const [permitResponse, setPermitResponse] = useState(null);

	const connect = async () => {
		console.log(tokenAddress, permitContractAddress);
		console.log((await wallets[0].getEthersProvider()));
		setProvider((await wallets[0].getEthersProvider()))
		setSigner((await wallets[0].getEthersProvider()).getSigner())
	}

	// Wait until the Privy client is ready before taking any actions
	if (!ready) {
		return null;
	}

	const setNewNumber = async () => {
		if (signer) {
			const amount = ethers.utils.parseEther("1");
			const myToken = new ethers.Contract(tokenAddress, myTokenAbi, await signer)

			const permitContract = new ethers.Contract(permitContractAddress, abi, await signer)
			const deadline = Math.floor(Date.now() / 1000) + 3600;

			const domain = {
				name: await myToken.name(),
				version: '1',
				chainId: (await provider.getNetwork()).chainId,
				verifyingContract: await myToken.address
			};


			const types = {
				Permit: [
					{ name: 'owner', type: 'address' },
					{ name: 'spender', type: 'address' },
					{ name: 'value', type: 'uint256' },
					{ name: 'nonce', type: 'uint256' },
					{ name: 'deadline', type: 'uint256' },
				],
			};
			const data = {
				owner: await signer.getAddress(),
				spender: await permitContract.address,
				value: amount,
				nonce: await myToken.nonces(await signer.getAddress()),
				deadline: deadline
			};

			var sig = await (await (await wallets[0].getEthersProvider()).getSigner())._signTypedData(domain, types, data);
			sig = ethers.utils.splitSignature(sig);

			// if you wish to perform the tx yourself
			// try {
			// 	let tx = await permitContract.makeTradeFake(
			// 		'0xfrom',
			// 		'0xto',
			// 		amount,
			// 		deadline,
			// 		sig.v,
			// 		sig.r,
			// 		sig.s
			// 	);
			// 	console.log(tx);
			// } catch (err) {
			// 	console.log(err);
			// }

			// check that the tokenReceiver address can now spend tokens on behalf of the tokenOwner
			// console.log(`Check allowance of tokenReceiver: ${await myToken.allowance(await signer.getAddress(), "0x53845808d942F791eaA789a1AB1e5fDBfB8BaFFD")}`);


			const permitData = encodeFunctionData({
				abi: abi,
				functionName: 'makeTradeFake',
				args: [await signer.getAddress(), '0x000000000000000000000000000000000000dead', amount, deadline, sig.v, sig.r, sig.s]
			});

			const permitRequest = {
				chainId: (await provider.getNetwork()).chainId,
				target: permitContractAddress,
				data: permitData,
				user: await signer.getAddress()
			};

			const relay = new GelatoRelay();
			const pResponse = await relay.sponsoredCallERC2771(permitRequest, await provider, apiKey);
			setPermitResponse(pResponse)
			console.log('Relay response:', pResponse);
		} else {
			console.error('Signer or number not found');
		}
	};

	return (
		<div className="App">
			<header className="App-header">
				{/* If the user is not authenticated, show a login button */}
				{/* If the user is authenticated, show the user object and a logout button */}
				{ready && authenticated ? (
					<div>
						<textarea
							readOnly
							value={JSON.stringify(user, null, 2)}
							style={{ width: "600px", height: "250px", borderRadius: "6px" }}
						/>
						<br />
						<button onClick={logout} style={{ marginTop: "20px", padding: "12px", backgroundColor: "#069478", color: "#FFF", border: "none", borderRadius: "6px" }}>
							Log Out
						</button>
						{
							!signer ? (
								<button onClick={connect} style={{ marginTop: "20px", marginLeft: '20px', padding: "12px", backgroundColor: "#069478", color: "#FFF", border: "none", borderRadius: "6px" }}>
									Init your wallet
								</button>

							) : (
								<button onClick={setNewNumber} style={{ marginTop: "20px", marginLeft: '20px', padding: "12px", backgroundColor: "#069478", color: "#FFF", border: "none", borderRadius: "6px" }}>
									Transfer 1 token to 0x00..00dead
								</button>
							)
						}
						{
							permitResponse && (
								<div style={{ fontSize: '12px', marginTop: '12px' }}>
									Checkout the log here: <a target="_blank" href={`https://api.gelato.digital/tasks/status/${permitResponse.taskId}`} rel="noreferrer">https://api.gelato.digital/tasks/status/{permitResponse.taskId}</a>
								</div>
							)
						}
					</div>
				) : (
					<button onClick={login} style={{ padding: "12px", backgroundColor: "#069478", color: "#FFF", border: "none", borderRadius: "6px" }}>Log In</button>
				)}
			</header>
		</div>
	);
}

export default App;
