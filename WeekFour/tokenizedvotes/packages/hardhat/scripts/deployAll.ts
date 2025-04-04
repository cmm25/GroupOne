import hre from "hardhat";
import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment of all contracts");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy VoteToken
  console.log("\n📝 Deploying VoteToken contract");
  const VoteToken = await ethers.getContractFactory("VoteToken");
  const voteToken = await VoteToken.deploy();
  await voteToken.deployed();
  console.log("VoteToken deployed to:", voteToken.address);

  // 2. Deploy TokenizedBallot
  console.log("\n🗳️ Deploying TokenizedBallot contract");

  // Define proposals
  const proposals = [
    ethers.id("Proposal 1").substring(0, 66),
    ethers.id("Proposal 2").substring(0, 66),
    ethers.id("Proposal 3").substring(0, 66),
  ];

  // Use the current block as the target block
  const currentBlock = await ethers.provider.getBlockNumber();

  const TokenizedBallot = await ethers.getContractFactory("TokenizedBallot");
  const tokenizedBallot = await TokenizedBallot.deploy(proposals, voteToken.address, currentBlock);
  await tokenizedBallot.deployed();

  console.log("TokenizedBallot deployed to:", tokenizedBallot.address);
  console.log(
    "Using proposals:",
    proposals.map(p => p.substring(0, 10) + "..."),
  );
  console.log("Target block number:", currentBlock);

  // 3. Deploy Oracle Consumer (only for Sepolia or local)
  console.log("\n🔮 Deploying OracleConsumer contract");

  const chainId = (await ethers.provider.getNetwork()).chainId;
  let linkToken, oracleAddress;

  if (chainId === 31337n) {
    // Hardhat local network
    console.log("Local network detected, deploying mock contracts");

    // Deploy mock LINK token
    const MockLinkToken = await ethers.getContractFactory("MockLinkToken");
    const mockLinkToken = await MockLinkToken.deploy();
    await mockLinkToken.deployed();
    console.log("MockLinkToken deployed to:", mockLinkToken.address);

    // Deploy mock Oracle
    const MockOracle = await ethers.getContractFactory("MockOracle");
    const mockOracle = await MockOracle.deploy(mockLinkToken.address);
    await mockOracle.deployed();
    console.log("MockOracle deployed to:", mockOracle.address);

    linkToken = mockLinkToken.address;
    oracleAddress = mockOracle.address;
  } else if (chainId === 11155111n) {
    // Sepolia
    linkToken = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
    oracleAddress = "0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD";
    console.log("Using Sepolia LINK token:", linkToken);
    console.log("Using Sepolia Oracle:", oracleAddress);
  } else {
    console.log("Unsupported network for oracle deployment, skipping...");
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    linkToken = zeroAddress;
    oracleAddress = zeroAddress;
  }

  if (linkToken !== "0x0000000000000000000000000000000000000000") {
    const OracleConsumer = await ethers.getContractFactory("OracleConsumer");
    const oracleConsumer = await OracleConsumer.deploy(linkToken, oracleAddress);
    await oracleConsumer.deployed();
    console.log("OracleConsumer deployed to:", oracleConsumer.address);

    // Fund with LINK if local network
    if (chainId === 31337n) {
      console.log(
        "Local network detected. IMPORTANT: You need to manually fund the oracle consumer contract with LINK",
      );
      console.log(`Oracle Consumer Address: ${oracleConsumer.address}`);
    }
  }

  // 4. Update the .env files with the new contract addresses
  console.log("\n🔄 Updating environment files with contract addresses");

  // Print instructions for updating the .env files
  console.log("\n📋 IMPORTANT: Update your .env files with these addresses:");
  console.log("\nFor backend/.env:");
  console.log(`TOKEN_CONTRACT_ADDRESS=${voteToken.address}`);
  console.log(`BALLOT_CONTRACT_ADDRESS=${tokenizedBallot.address}`);

  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
