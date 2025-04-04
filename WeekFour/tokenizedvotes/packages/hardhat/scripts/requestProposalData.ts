import { ethers } from "hardhat";
import { parseEther } from "ethers";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Requesting proposal data with account:", deployer.address);

    // Get the OracleConsumer contract - replace with the actual contract factory approach
    const OracleConsumer = await ethers.getContractFactory("OracleConsumer");
    const oracleConsumerAddress = "0x1234567890123456789012345678901234567890"; // Replace with actual address
    const oracleConsumer = await OracleConsumer.attach(oracleConsumerAddress);

    // This would be a real Chainlink job ID on mainnet/testnet
    // For testing locally, any bytes32 value will do
    const jobId = ethers.id("29fa9aa13bf1468788b7cc4a500a45b8").substring(0, 66);

    // Payment amount in LINK (1 LINK = 10^18 Juels)
    const payment = parseEther("0.1");

    // URL to fetch proposal data from
    // This could be a public API, IPFS, or any other data source
    const url = "https://example.com/api/proposals";

    // JSON path to the proposal data in the API response
    const path = "data.proposals";

    console.log("Requesting data from oracle...");

    const tx = await oracleConsumer.requestProposalData(jobId, payment, url, path);

    console.log("Request transaction hash:", tx.hash);
    await tx.wait();

    console.log("Request sent successfully! Wait for the oracle to fulfill the request.");
    console.log("Check the contract state later to see the results.");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
