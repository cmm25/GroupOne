import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployTokenizedBallot: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    // Get the deployed VoteToken contract
    const voteToken = await hre.ethers.getContract("VoteToken", deployer);

    // Define proposals using ethers from hardhat
    const proposals = [
        hre.ethers.id("Proposal 1").substring(0, 66), 
        hre.ethers.id("Proposal 2").substring(0, 66),
        hre.ethers.id("Proposal 3").substring(0, 66),
    ];

    // Get current block number to use as target block
    const currentBlock = await hre.ethers.provider.getBlockNumber();

    // Deploy TokenizedBallot with current block as target
    const deployment = await deploy("TokenizedBallot", {
        from: deployer,
        args: [proposals, await voteToken.getAddress(), currentBlock],
        log: true,
        autoMine: true,
    });

    const tokenizedBallot = await hre.ethers.getContract("TokenizedBallot", deployer);
    console.log("🗳️ TokenizedBallot deployed at:", deployment.address);
    console.log("🔢 Using target block number:", currentBlock);
};

export default deployTokenizedBallot;
deployTokenizedBallot.tags = ["TokenizedBallot"];
deployTokenizedBallot.dependencies = ["VoteToken"]; 
