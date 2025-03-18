# Ethereum Ballot Project

A decentralized voting system implemented on the Ethereum blockchain using Solidity smart contracts. This project allows for transparent and secure voting where a chairperson can give voting rights, and voters can cast votes or delegate their voting power to others.

## Features

- Create proposals for voting
- Assign voting rights to addresses
- Cast votes on proposals
- Delegate voting power
- Query voting results
- Get winning proposal

## Project Structure

- `contracts/Ballot.sol`: Smart contract for the voting system
- `scripts/`: TypeScript scripts for contract interaction
  - `DeploywithViem.ts`: Contract deployment
  - `VotingRights.ts`: Manage voting rights
  - `CastVote.ts`: Vote on proposals
  - `DelegateVote.ts`: Delegate votes
  - `QueryResults.ts`: View all proposals and votes
  - `GetWinningProposal.ts`: Check winning proposal

## Setup

1. Install dependencies:

   ```shell
   npm install
   ```

2. Configure environment:
   Create a `.env` file with:
   ```
   INFURA_API_KEY=your-infura-api-key
   PRIVATE_KEY=your-wallet-private-key-without-0x
   ```

## Usage Guide

### 1. Deploy the Contract

Deploy with your initial proposals:

```shell
npx ts-node scripts/DeploywithViem.ts "Proposal1" "Proposal2" "Proposal3"
```

Save the deployed contract address for future interactions.

### 2. Give Voting Rights

The deploying address (chairperson) can give voting rights:

```shell
npx ts-node scripts/VotingRights.ts <contract-address> <voter-address>
```

### 3. Cast Votes

Voters with rights can vote on proposals:

```shell
npx ts-node scripts/CastVote.ts <contract-address> <proposal-number>
```

Note: Proposal numbers start from 0

### 4. Delegate Voting Power

Voters can delegate their vote to another address:

```shell
npx ts-node scripts/DelegateVote.ts <contract-address> <delegate-address>
```

### 5. View Results

Check current voting status:

```shell
npx ts-node scripts/QueryResults.ts <contract-address>
```

See winning proposal:

```shell
npx ts-node scripts/GetWinningProposal.ts <contract-address>
```

## Example Workflow

1. Deploy contract with proposals:

   ```shell
   npx ts-node scripts/DeploywithViem.ts "Coffee" "Tea" "Water"
   # Contract deployed to: 0x123...
   ```

2. Give voting rights to addresses:

   ```shell
   npx ts-node scripts/VotingRights.ts 0x123... 0xvoter1...
   npx ts-node scripts/VotingRights.ts 0x123... 0xvoter2...
   ```

3. Cast votes:

   ```shell
   npx ts-node scripts/CastVote.ts 0x123... 1  # Vote for "Tea"
   ```

4. Check results:
   ```shell
   npx ts-node scripts/QueryResults.ts 0x123...
   ```

## Requirements

- Node.js and npm
- An Infura API key
- Sepolia testnet ETH (get from a faucet)
- A wallet private key with Sepolia ETH

## Network

This project is configured for the Sepolia testnet. Make sure you have:

- Sepolia ETH in your wallet
- A valid Infura API key
- The correct network configuration

## Troubleshooting

- If transactions fail, check your Sepolia ETH balance
- Verify voter addresses have been granted voting rights
- Ensure you're using the correct contract address
- Check that proposals exist (index starts at 0)

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

```
