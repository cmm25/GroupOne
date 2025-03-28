import { createPublicClient, hexToString, http } from "viem";
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
import * as dotenv from "dotenv";
import { sepolia } from "viem/chains";

dotenv.config();

export async function queryingResult(publicClient: any = null) {
    const infuraApiKey = process.env.INFURA_API_KEY || "";
    const rpcEndpoint = `https://sepolia.infura.io/v3/${infuraApiKey}`;
    // Use provided client or create a new one
    if (!publicClient) {
        const rpcUrl = rpcEndpoint;
        if (!rpcUrl) throw new Error("RPC endpoint URL not provided in .env file");

        publicClient = createPublicClient({
            chain: sepolia,
            transport: http(rpcUrl),
        });
    }

    // Parse command line arguments
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 1)
        throw new Error(
            "Parameters not provided. Usage: ts-node QueryResults.ts <contract-address>"
        );
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");

    console.log(`\n🗳️  Ballot Contract Query Results 🗳️`);
    console.log(`Contract address: ${contractAddress}`);

    try {
        // Get chairperson
        const chairperson = await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: "chairperson",
        });
        console.log(`\nChairperson: ${chairperson}`);

        // Fetch and display all proposals
        console.log("\n📊 Proposals:");
        let index = 0;
        let proposalCount = 0;
        let proposals = [];

        while (true) {
            try {
                const proposal = await publicClient.readContract({
                    address: contractAddress,
                    abi,
                    functionName: "proposals",
                    args: [BigInt(index)],
                });

                const name = hexToString(proposal[0], { size: 32 }).replace(/\0/g, "");
                const voteCount = proposal[1] as bigint;

                console.log(
                    `  ${index}: "${name}" - ${voteCount} vote${voteCount === BigInt(1) ? "" : "s"
                    }`
                );

                proposals.push({ index, name, voteCount });
                index++;
                proposalCount++;
            } catch (error) {
                break;
            }
        }

        // Get winning proposal using contract function
        if (proposalCount > 0) {
            try {
                const winningProposalIndex = await publicClient.readContract({
                    address: contractAddress,
                    abi,
                    functionName: "winningProposal",
                });

                const winnerName = await publicClient.readContract({
                    address: contractAddress,
                    abi,
                    functionName: "winnerName",
                });

                const winnerNameStr = hexToString(winnerName, { size: 32 }).replace(
                    /\0/g,
                    ""
                );

                console.log(
                    `\n🏆 Current winning proposal: #${winningProposalIndex} - "${winnerNameStr}" with ${proposals[Number(winningProposalIndex)].voteCount
                    } vote${proposals[Number(winningProposalIndex)].voteCount === BigInt(1)
                        ? ""
                        : "s"
                    }`
                );
            } catch (error) {
                console.log("\n⚠️ Could not determine winning proposal");
            }
        } else {
            console.log("\nNo proposals found in the ballot.");
        }
    } catch (error) {
        console.error("Error querying ballot contract:", error);
        throw error;
    }
}

// Allow script to be run directly
if (require.main === module) {
    queryingResult()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
