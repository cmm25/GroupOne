import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    // Deploy the Vote Token contract
    await deploy("VoteToken", {
        from: deployer,
        args: [],
        log: true,
        autoMine: true,
    });

    const voteToken = await hre.ethers.getContract("VoteToken", deployer);
    console.log("📝 VoteToken deployed at:", await voteToken.getAddress());
};

export default deployVoteToken;
deployVoteToken.tags = ["VoteToken"];
