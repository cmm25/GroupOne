import {
    createPublicClient,
    http,
    createWalletClient,
    formatEther,
    toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi, bytecode } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
import * as dotenv from "dotenv";
dotenv.config();

const infuraApiKey = process.env.INFURA_API_KEY || "";
const rpcEndpoint = `https://sepolia.infura.io/v3/${infuraApiKey}`;

if (!infuraApiKey) throw new Error("Infura API key not provided in .env file");

const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
    // Check if all required arguments are provided
    if (process.argv.length < 5) {
        throw new Error("Usage: ts-node script.ts <token-contract-address> <target-block-number> <proposal1> <proposal2> ...");
    }

    // Get token contract address and target block number from command line arguments
    const tokenContractAddress = process.argv[2];
    const targetBlockNumber = BigInt(process.argv[3]);
    
    // Get proposals from remaining arguments
    const proposals = process.argv.slice(4);
    if (proposals.length < 1)
        throw new Error("At least one proposal must be provided");

    if (!rpcEndpoint)
        throw new Error("RPC endpoint URL not provided in .env file");

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(rpcEndpoint),
    });

    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const deployer = createWalletClient({
        account,
        chain: sepolia,
        transport: http(rpcEndpoint),
    });

    console.log("Deployer address:", deployer.account.address);
    const balance = await publicClient.getBalance({
        address: deployer.account.address,
    });
    console.log(
        "Deployer balance:",
        formatEther(balance),
        deployer.chain.nativeCurrency.symbol
    );
    
    console.log("\nDeploying TokenizedBallot contract");
    console.log("Token contract address:", tokenContractAddress);
    console.log("Target block number:", targetBlockNumber.toString());
    console.log("Proposals:", proposals);

    const hash = await deployer.deployContract({
        abi,
        bytecode: bytecode as `0x${string}`,
        args: [
            proposals.map((prop) => toHex(prop, { size: 32 })),
            tokenContractAddress,
            targetBlockNumber
        ],
    });
    
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("TokenizedBallot contract deployed to:", receipt.contractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});