import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// ABI for Voting Contract
const votingAbi = parseAbi([
    'function addVote(string candidate, uint256 votes) public',
    'function queryingResults() public view returns (string winner, uint256 totalVotes)'
]);

// Contract Details
const CONTRACT_ADDRESS = "0xYourContractAddressHere"; // Replace with actual address
const PRIVATE_KEY = "0xYourPrivateKeyHere";          // Use an environment variable in production

// Clients Setup
const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
});

const walletClient = createWalletClient({
    account: privateKeyToAccount(PRIVATE_KEY),
    chain: mainnet,
    transport: http()
});

async function main() {
   
  try {
    const vote1 = 10;  
    const vote2 = 20;
        // Add Votes
        await walletClient.writeContract({
          
          address: CONTRACT_ADDRESS,
            abi: votingAbi,
            functionName: 'addVote',
            args: ['Alice', vote1]
        });

        await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: votingAbi,
            functionName: 'addVote',
            args: ['Bob', vote2]
        });

        // Query Results
        const [winner, totalVotes] = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: votingAbi,
            functionName: 'queryingResults'
        });

        console.log(`Winner: ${winner}, Total Votes: ${totalVotes}`);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
