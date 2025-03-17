import { describe, it, expect } from 'vitest';
import { createPublicClient, parseAbi } from 'viem';
import { mainnet } from 'viem/chains';

const CONTRACT_ADDRESS = "0xYourContractAddressHere"; // Replace with deployed address

// ABI for Voting Contract
const votingAbi = parseAbi([
    'function addVote(string candidate, uint256 votes) public',
    'function queringResults() public view returns (string winner, uint256 totalVotes)'
]);

const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
});

describe('Voting Contract Tests', () => {
    it('should return the correct winner and total votes', async () => {
        const [winner, totalVotes] = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: votingAbi,
            functionName: 'queringResults'
        });

        expect(winner).toBe('Bob'); // Expected Winner
        expect(Number(totalVotes)).toBe(20); // Expected Total Votes
    });
});
