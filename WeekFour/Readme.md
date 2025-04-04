# Tokenized Voting System

This project implements a tokenized ballot system with oracle integration, allowing users to vote on proposals with ERC20 tokens and fetch proposal data from external sources via Chainlink oracles.

## Project Structure

- **`/backend`**: NestJS API for handling contract interactions without requiring users to pay gas
- **`/tokenizedvotes`**: Scaffold-ETH based dApp with Hardhat for smart contracts and Next.js frontend

## Requirements Achieved

- ✅ **Tokenized Voting**: Implemented ERC20 token-based voting system
- ✅ **Delegation**: Added ability to delegate voting power to another address
- ✅ **Oracle Integration**: Added Chainlink oracle to fetch proposal data from external APIs
- ✅ **Backend API**: Created NestJS API for gas-less interactions with the contracts
- ✅ **Frontend dApp**: Developed user interface for all voting operations
- ✅ **Contract Testing**: Implemented tests for token and ballot contracts

## Challenges Faced

### 1. Library Compatibility Issues

- **Problem**: Initial incompatibility between OpenZeppelin contracts, ethers.js v6, and Chainlink contracts
- **Solution**: Updated import paths for Chainlink interfaces (specifically `LinkTokenInterface.sol`) and fixed method calls in the `OracleConsumer` contract

### 2. Contract Function Override Errors

- **Problem**: Encountered errors when overriding non-virtual functions (`_transfer` and `_burn`) in the ERC20 token
- **Solution**: Replaced with the appropriate override of the virtual `_update` method which is recommended by OpenZeppelin

### 3. Type Definition Issues in Backend

- **Problem**: TypeScript errors with NestJS Swagger decorators
- **Solution**: Simplified DTO classes by removing decorators and implementing plain classes to avoid dependency issues

### 4. Integration Between Frontend and Smart Contracts

- **Problem**: Difficulty connecting the Scaffold-ETH frontend with deployed contracts
- **Solution**: Used Hardhat's export functionality to generate contract ABIs and addresses for the frontend

## How to Deploy

### Smart Contracts

```bash
# Navigate to the Hardhat directory
cd tokenizedvotes/packages/hardhat

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Start local Hardhat node
npx hardhat node

# Deploy contracts to local network
npx hardhat deploy
```

### Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with required variables
cp .env.example .env
# Edit .env with appropriate values:
# - RPC_ENDPOINT=http://127.0.0.1:8545
# - PRIVATE_KEY=<private key from Hardhat node>
# - TOKEN_CONTRACT_ADDRESS=<deployed token address>
# - BALLOT_CONTRACT_ADDRESS=<deployed ballot address>

# Start the backend
npm run start:dev
```

### Frontend

```bash
# Navigate to frontend directory
cd tokenizedvotes/packages/nextjs

# Install dependencies
npm install

# Export contract ABIs from Hardhat
cd ../hardhat && npx hardhat export --export-all ../nextjs/contracts/deployedContracts.ts

# Start the frontend
cd ../nextjs && npm run dev
```

## How to Navigate the dApp

1. **Connect Wallet**:

   - Ensure MetaMask is connected to the Hardhat network (http://127.0.0.1:8545, ChainID: 31337)
   - Use the "Connect" button in the top right corner

2. **Get Tokens**:

   - On the home page, enter the amount of tokens you want
   - Click "Request tokens" to mint tokens to your address

3. **Delegate Votes** (Optional):

   - Navigate to the "Delegate Votes" page
   - Enter the address to delegate to
   - Submit the transaction

4. **Oracle Integration**:

   - Go to the "Oracle" page to request proposal data from external sources
   - Configure the request parameters and submit

5. **Vote on Proposals**:

   - Select a proposal from the dropdown on the home page
   - Enter the amount of voting power to use
   - Click "Cast Vote" to submit your vote

6. **View Results**:

   - Check the home page for recent votes and the current winning proposal

7. **Debug Contracts**:
   - Use the "Debug Contracts" page for direct interaction with contract functions

## Backend API Endpoints

The backend provides these key endpoints:

- `POST /tokens/mint`: Mint tokens to a user address
- `GET /contract-address`: Get token contract address
- `GET /tokens/recent-votes`: Get list of recent votes
- `GET /tokens/voting-power/:address`: Get voting power for an address
- `GET /tokens/proposals`: Get all proposals
- `GET /tokens/winning-proposal`: Get the current winning proposal
- `POST /tokens/delegate`: Delegate votes to another address

## Learning Goals

### Achieved

- ✅ Understanding token-based voting mechanisms
- ✅ Working with delegation patterns
- ✅ Integrating oracles for external data
- ✅ Building a full-stack dApp with Web3 authentication
- ✅ Creating a backend API for blockchain interactions

### Partially Achieved

- ⚠️ Production-ready deployment practices (focused on local development)
- ⚠️ Comprehensive event handling (implemented basic version)

### Future Improvements

- Add more robust error handling
- Implement historical voting data tracking
- Add user profile and voting history section
- Enhance security with proper authentication for backend
- Optimize gas usage for voting operations
