# Ethereum Ballot Project

This project implements a voting system using Solidity smart contracts on the Ethereum blockchain. It includes scripts for deploying the Ballot contract, giving voting rights, casting votes, delegating votes, and querying results.

## Project Structure

- `contracts/Ballot.sol`: The main voting contract
- `scripts/`: TypeScript scripts to interact with the contract
  - `DeploywithViem.ts`: Deploys the contract with proposal names
  - `VotingRights.ts`: Gives voting rights to addresses
  - `CastVote.ts`: Allows voting on proposals
  - `DelegateVote.ts`: Delegates votes to another address
  - `QueryResults.ts`: Queries all proposals and their vote counts
  - `GetWinningProposal.ts`: Gets the current winning proposal

## Setup Instructions

1. Install dependencies:
   ```shell
   npm install
   ```

2. Create a `.env` file with:
   ```
   PRIVATE_KEY=your-private-key-without-0x-prefix
   RPC_ENDPOINT_URL=your-rpc-endpoint-url
   ```

3. Deploy the contract:
   ```shell
   npx ts-node scripts/DeploywithViem.ts "Proposal1" "Proposal2" "Proposal3"
   ```

## Current Issues I'm Facing

### 1. Private Key Format Problems

**Error Message:**
```
Error: invalid private key, expected hex or 32 bytes, got string
```

**What I've Tried:**
- Removed the "0x" prefix from my private key in the `.env` file
- Verified the private key is 64 characters long
- Checked that my code adds the "0x" prefix when using the key

**Questions:**
- How can I verify my private key is in the correct format?
- Is there a way to test the private key without deploying?

### 2. RPC Endpoint Connection Issues

**Error Message:**
```
Details: {"code":-32600,"message":"Invalid access key"}
URL: https://eth-sepolia.g.alchemy.com/v2/[my-key]
```

**What I've Tried:**
- Generated a new API key from Alchemy
- Verified the API key in my Alchemy dashboard
- Tried using a different RPC provider (Infura)

**Questions:**
- How can I test if my RPC endpoint is working correctly?
- Are there any free, reliable RPC endpoints I can use for testing?

### 3. Contract Deployment Failures

**Error Messages:**
- Sometimes get "Insufficient funds" even though I have Sepolia ETH
- Occasionally see "Gas estimation failed"

**What I've Tried:**
- Obtained more Sepolia ETH from faucets
- Manually specified gas parameters
- Checked my account balance before deployment

**Questions:**
- What's a reliable way to check my Sepolia ETH balance?
- How much ETH is typically needed for deploying this contract?

## Help Needed

I'm specifically looking for help with:

1. Troubleshooting the private key format issue
2. Setting up a reliable RPC endpoint connection
3. Successfully deploying the contract to Sepolia testnet
4. Understanding how to properly test the voting functionality

Any guidance or code examples would be greatly appreciated. I can provide more details or error logs if needed.

## Hardhat Commands

For reference, here are some useful Hardhat commands:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
```
