import {
    createPublicClient,
    http,
    createWalletClient,
    formatEther,
    toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import * as dotenv from "dotenv";
dotenv.config();

const infuraApiKey = process.env.INFURA_API_KEY || "";
const rpcEndpoint = `https://sepolia.infura.io/v3/${infuraApiKey}`;

if (!infuraApiKey) throw new Error("Infura API key not provided in .env file");

const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
    const proposals = process.argv.slice(2);
    if (!proposals || proposals.length < 1)
        throw new Error("Proposals not provided");

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
    console.log("\nDeploying Ballot contract");
    const hash = await deployer.deployContract({
        abi,
        bytecode: bytecode as `0x${string}`,
        args: [proposals.map((prop) => toHex(prop, { size: 32 }))],
    });
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Ballot contract deployed to:", receipt.contractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
