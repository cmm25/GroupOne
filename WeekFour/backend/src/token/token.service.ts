import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

// We'll use a simple in-memory store for recent votes
// In a production app, you would use a proper database
export interface VoteRecord {
  voter: string;
  proposal: number;
  amount: number;
  timestamp: number;
  transactionHash: string;
}

@Injectable()
export class TokenService implements OnModuleInit {
  private readonly logger = new Logger(TokenService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private tokenContract: ethers.Contract;
  private ballotContract: ethers.Contract;
  private recentVotes: VoteRecord[] = [];

  // Contract addresses - update these with your deployed contract addresses
  private tokenAddress =
    process.env.TOKEN_CONTRACT_ADDRESS ||
    '0x0000000000000000000000000000000000000000';
  private ballotAddress =
    process.env.BALLOT_CONTRACT_ADDRESS ||
    '0x0000000000000000000000000000000000000000';

  constructor() {
    dotenv.config();
  }

  async onModuleInit() {
    await this.initializeBlockchainConnection();
  }

  private async initializeBlockchainConnection() {
    try {
      // Connect to the blockchain
      this.provider = new ethers.JsonRpcProvider(
        process.env.RPC_ENDPOINT || 'http://localhost:8545',
      );

      // Create a wallet instance using the private key from environment variables
      if (!process.env.PRIVATE_KEY) {
        this.logger.error('No private key found in environment variables');
        return;
      }

      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      this.logger.log(
        `Connected to blockchain with wallet: ${this.wallet.address}`,
      );

      // Initialize the token contract
      const tokenAbi = [
        'function mint(address to, uint256 amount) external',
        'function balanceOf(address account) external view returns (uint256)',
        'function name() external view returns (string)',
        'function symbol() external view returns (string)',
        'function delegate(address delegatee) external',
        'function getPastVotes(address account, uint256 blockNumber) external view returns (uint256)',
      ];

      this.tokenContract = new ethers.Contract(
        this.tokenAddress,
        tokenAbi,
        this.wallet,
      );
      this.logger.log(
        `Token contract initialized at address: ${this.tokenAddress}`,
      );

      // Initialize the ballot contract
      const ballotAbi = [
        'function vote(uint256 proposal, uint256 amount) external',
        'function votingPower(address account) external view returns (uint256)',
        'function winningProposal() external view returns (uint256)',
        'function winnerName() external view returns (bytes32)',
        'function proposals(uint256) external view returns (bytes32 name, uint256 voteCount)',
      ];

      this.ballotContract = new ethers.Contract(
        this.ballotAddress,
        ballotAbi,
        this.wallet,
      );
      this.logger.log(
        `Ballot contract initialized at address: ${this.ballotAddress}`,
      );

      // Set up event listener for vote events
      this.setupVoteEventListener();
    } catch (error) {
      this.logger.error(
        `Failed to initialize blockchain connection: ${error.message}`,
      );
    }
  }

  private setupVoteEventListener() {
    // In a real implementation, you would listen for events from the ballot contract
    // For this example, we'll just add votes manually through the API
    this.logger.log('Vote event listener set up');
  }

  async mintTokens(address: string, amount: number) {
    try {
      this.logger.log(`Minting ${amount} tokens to ${address}`);

      // Validate the contract is initialized
      if (!this.tokenContract) {
        await this.initializeBlockchainConnection();
      }

      // Mint tokens to the specified address
      const tx = await this.tokenContract.mint(
        address,
        ethers.parseEther(amount.toString()),
      );
      const receipt = await tx.wait();

      this.logger.log(
        `Tokens minted successfully! Transaction hash: ${receipt.hash}`,
      );

      return {
        success: true,
        transactionHash: receipt.hash,
        address,
        amount,
      };
    } catch (error) {
      this.logger.error(`Failed to mint tokens: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async delegateVotes(from: string, to: string) {
    try {
      this.logger.log(`Delegating votes from ${from} to ${to}`);

      // We would normally use the user's wallet to sign this transaction
      // For this demo, we're using the backend wallet
      const tx = await this.tokenContract.delegate(to);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      this.logger.error(`Failed to delegate votes: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getVotingPower(address: string) {
    try {
      const votingPower = await this.ballotContract.votingPower(address);
      return {
        votingPower: ethers.formatEther(votingPower),
        address,
      };
    } catch (error) {
      this.logger.error(`Failed to get voting power: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getProposals() {
    try {
      // Get the number of proposals by trying to access them until we get an error
      let proposals = [];
      let i = 0;

      while (true) {
        try {
          const proposal = await this.ballotContract.proposals(i);
          proposals.push({
            id: i,
            name: ethers.toUtf8String(proposal.name).replace(/\0/g, ''),
            voteCount: ethers.formatEther(proposal.voteCount),
          });
          i++;
        } catch (error) {
          break;
        }
      }

      return {
        proposals,
      };
    } catch (error) {
      this.logger.error(`Failed to get proposals: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getContractAddress() {
    return {
      tokenAddress: this.tokenAddress,
      ballotAddress: this.ballotAddress,
    };
  }

  // Store a vote record
  addVoteRecord(
    voter: string,
    proposal: number,
    amount: number,
    transactionHash: string,
  ) {
    const voteRecord: VoteRecord = {
      voter,
      proposal,
      amount,
      timestamp: Date.now(),
      transactionHash,
    };

    // Add to the beginning of the array and limit to 10 records
    this.recentVotes.unshift(voteRecord);
    if (this.recentVotes.length > 10) {
      this.recentVotes.pop();
    }

    return voteRecord;
  }

  // Get the recent votes
  getRecentVotes() {
    return {
      votes: this.recentVotes,
    };
  }

  // Get the winning proposal
  async getWinningProposal() {
    try {
      const winningProposalId = await this.ballotContract.winningProposal();
      const winnerName = await this.ballotContract.winnerName();

      const proposal = await this.ballotContract.proposals(winningProposalId);

      return {
        id: winningProposalId.toString(),
        name: ethers.toUtf8String(winnerName).replace(/\0/g, ''),
        voteCount: ethers.formatEther(proposal.voteCount),
      };
    } catch (error) {
      this.logger.error(`Failed to get winning proposal: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
