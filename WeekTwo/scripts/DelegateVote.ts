import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    // Check command line arguments
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 2)
        throw new Error(
            "Parameters not provided. Usage: ts-node DelegateVote.ts <contract-address> <delegate-address>"
        );

    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");

    const delegateAddress = parameters[1] as `0x${string}`;
    if (!delegateAddress) throw new Error("Delegate address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(delegateAddress))
        throw new Error("Invalid delegate address");

    // Setup clients
    const rpcUrl = process.env.RPC_ENDPOINT_URL;
    if (!rpcUrl) throw new Error("RPC endpoint URL not provided in .env file");

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("Private key not provided in .env file");

    const account = privateKeyToAccount(`0x${privateKey}`);

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcUrl),
    });

    const walletClient = createWalletClient({
        chain: sepolia,
        transport: http(rpcUrl),
        account,
    });

    console.log(`\n🗳️  Delegating Vote 🗳️`);
    console.log(`Contract address: ${contractAddress}`);
    console.log(`Delegating from: ${account.address}`);
    console.log(`Delegating to: ${delegateAddress}`);

    try {
        // Check if the voter has the right to vote
        const voter = (await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: "voters",
            args: [account.address],
        })) as [bigint, boolean, string, bigint];

        if (voter[0] === 0n) {
            console.error("Error: You don't have the right to vote");
            process.exit(1);
        }

        if (voter[1] === true) {
            console.error("Error: You have already voted or delegated your vote");
            process.exit(1);
        }

        // Check if the delegate has the right to vote
        const delegate = (await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: "voters",
            args: [delegateAddress],
        })) as [bigint, boolean, string, bigint];

        if (delegate[0] === 0n) {
            console.error("Error: The delegate doesn't have the right to vote");
            process.exit(1);
        }

        // Delegate the vote
        console.log("\nDelegating vote...");
        const hash = await walletClient.writeContract({
            address: contractAddress,
            abi,
            functionName: "delegate",
            args: [delegateAddress],
        });

        console.log(`Transaction hash: ${hash}`);
        console.log("Waiting for transaction confirmation...");

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        console.log("Vote successfully delegated!");
    } catch (error) {
        console.error("Error delegating vote:", error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
