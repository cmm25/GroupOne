// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract OracleConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    // Store the latest data received from the oracle
    bytes32 public lastRequestId;
    bytes32[] public proposalNames;
    bool public dataReceived;

    // Event emitted when data is received from the oracle
    event DataReceived(bytes32 indexed requestId, bytes32[] proposalData);

    /**
     * Constructor initializes the contract
     * @param _link the LINK token address on the network
     * @param _oracle the Chainlink oracle address
     */
    constructor(address _link, address _oracle) ConfirmedOwner(msg.sender) {
        _setChainlinkToken(_link);
        _setChainlinkOracle(_oracle);
    }

    /**
     * Request proposal data from the oracle
     * @param _jobId the job specification ID that we want to run
     * @param _payment the amount of LINK to pay to the oracle
     * @param _url the URL to fetch data from
     * @param _path the JSON path to traverse
     */
    function requestProposalData(
        bytes32 _jobId,
        uint256 _payment,
        string memory _url,
        string memory _path
    ) public onlyOwner {
        Chainlink.Request memory req = _buildChainlinkRequest(_jobId, address(this), this.fulfill.selector);

        // Set the URL to perform the GET request on
        req._add("get", _url);

        // Set the path to find the desired data in the API response
        req._add("path", _path);

        // Send the request
        lastRequestId = _sendChainlinkRequest(req, _payment);
    }

    /**
     * Callback function called by the oracle with the data response
     * @param _requestId the request ID for which we're receiving the response
     * @param _proposalData the data received from the oracle
     */
    function fulfill(bytes32 _requestId, bytes32[] memory _proposalData) public recordChainlinkFulfillment(_requestId) {
        lastRequestId = _requestId;
        proposalNames = _proposalData;
        dataReceived = true;

        emit DataReceived(_requestId, _proposalData);
    }
    function getProposalNames() external view returns (bytes32[] memory) {
        return proposalNames;
    }
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(_chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }
}
