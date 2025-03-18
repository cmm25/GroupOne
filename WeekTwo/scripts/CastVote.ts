import {
    createPublicClient,
    http,
    createWalletClient,
    hexToString,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import * as dotenv from "dotenv";
dotenv.config();

const infuraApiKey = process.env.INFURA_API_KEY || "";
const rpcEndpoint = `https://sepolia.infura.io/v3/${infuraApiKey}`;
const voterPrivateKey = process.env.PRIVATE_KEY || "";

export async function CastVote() {
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 2)
        throw new Error("Parameters not provided");

    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");

    const proposalIndex = parameters[1];
    if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");

    // Create clients using Infura endpoint
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcEndpoint),
    });

    const account = privateKeyToAccount(`0x${voterPrivateKey}`);
    const voter = createWalletClient({
        account,
        chain: sepolia,
        transport: http(rpcEndpoint),
    });

    // Check proposal
    console.log("Proposal selected: ");
    try {
        const proposal = (await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: "proposals",
            args: [BigInt(proposalIndex)],
        })) as any[];
        const name = hexToString(proposal[0], { size: 32 });
        console.log(`Voting for proposal ${proposalIndex}: ${name}`);

        // Check voter status
        try {
            const voterStatus = (await publicClient.readContract({
                address: contractAddress,
                abi,
                functionName: "voters",
                args: [voter.account.address],
            })) as any;
            console.log("Voter status:", voterStatus);

            if (!voterStatus.weight) {
                return { success: false, error: "Voter does not have voting rights" };
            }

            if (voterStatus.voted) {
                return { success: false, error: "Voter has already voted" };
            }
        } catch (error) {
            console.log("Could not read voter status");
        }

        // Cast vote
        console.log(`Casting vote from ${voter.account.address}`);
        try {
            const hash = await voter.writeContract({
                address: contractAddress,
                abi,
                functionName: "vote",
                args: [BigInt(proposalIndex)],
            });
            console.log("Transaction hash:", hash);
            console.log("Waiting for confirmations...");
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            console.log("Transaction confirmed");

            // Check vote count after
            const proposalAfter = (await publicClient.readContract({
                address: contractAddress,
                abi,
                functionName: "proposals",
                args: [BigInt(proposalIndex)],
            })) as any[];
            console.log("Vote count after:", proposalAfter[1]);

            return { success: true, hash };
        } catch (error: any) {
            console.error("Transaction failed:", error.message);
            return { success: false, error: error.message };
        }
    } catch (error) {
        console.error("Could not read proposal", error);
        return { success: false, error: "Could not read proposal" };
    }
}

if (require.main === module) {
    CastVote()
        .then((result) => {
            if (result.success) {
                console.log("Successfully cast vote. Transaction hash:", result.hash);
            } else {
                console.log("Failed to cast vote:", result.error);
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        });
}
