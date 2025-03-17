import { createPublicClient, http, hexToString } from "viem";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const rpc = http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`);

async function getWinningProposal() {
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 1) {
        throw new Error("Usage: npx ts-node --files ./scripts/GetWinningProposal.ts contract_address");
    }
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) throw new Error("Invalid contract address");

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: rpc,
    });

    const winningProposalNumber: bigint = await publicClient.readContract({
        address: contractAddress,
        abi: abi,
        functionName: 'winningProposal',
    }) as bigint;

    const proposalNameBytes32 = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: 'winnerName',
    }) as `0x${string}`;

    const winningProposalName = hexToString(proposalNameBytes32, { size: 32 }).replace(/\0/g, '');

    console.log("winningProposalNumber is " + winningProposalNumber + " and proposal is " + winningProposalName);
}

getWinningProposal().catch((error: Error) => {
    console.error(error);
    process.exitCode = 1;
});

export { getWinningProposal };
