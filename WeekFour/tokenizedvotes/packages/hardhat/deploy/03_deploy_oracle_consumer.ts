import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

// Addresses for Sepolia network
const SEPOLIA_LINK_TOKEN = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
const SEPOLIA_CHAINLINK_ORACLE = "0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD";

const deployOracleConsumer: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;
    const chainId = await hre.getChainId();

    // Default to Sepolia addresses
    let linkToken = SEPOLIA_LINK_TOKEN;
    let oracleAddress = SEPOLIA_CHAINLINK_ORACLE;

    // For local development, deploy mock contracts
    if (chainId === "31337") {
        // Deploy mock LINK token and Oracle
        const mockLinkDeploy = await deploy("MockLinkToken", {
            from: deployer,
            args: [],
            log: true,
        });

        const mockOracleDeploy = await deploy("MockOracle", {
            from: deployer,
            args: [mockLinkDeploy.address],
            log: true,
        });

        linkToken = mockLinkDeploy.address;
        oracleAddress = mockOracleDeploy.address;
    }

    // Deploy OracleConsumer
    const oracleConsumer = await deploy("OracleConsumer", {
        from: deployer,
        args: [linkToken, oracleAddress],
        log: true,
        autoMine: true,
    });

    console.log("🔮 OracleConsumer deployed at:", oracleConsumer.address);
    console.log("LINK Token address:", linkToken);
    console.log("Oracle address:", oracleAddress);

    // For local development, fund the contract with LINK
    if (chainId === "31337") {
        console.log("Local network detected. You need to manually fund the oracle consumer with LINK tokens.");
        console.log(`Oracle Consumer Address: ${oracleConsumer.address}`);
        // Note: In a real implementation, you would need to:
        // 1. Get the LINK token contract
        // 2. Transfer LINK to the oracle consumer
    }
};

export default deployOracleConsumer;
deployOracleConsumer.tags = ["OracleConsumer"];
