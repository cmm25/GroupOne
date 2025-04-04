// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract MockOracle {
    LinkTokenInterface internal linkToken;

    struct Request {
        bytes32 id;
        address callbackAddr;
        bytes4 callbackFunctionId;
        bytes32[] data;
    }

    mapping(bytes32 => Request) private requests;

    event OracleRequest(bytes32 indexed requestId, address requester, bytes4 callbackFunctionId);

    constructor(address _link) {
        linkToken = LinkTokenInterface(_link);
    }

    function requestOracleData(
        address _sender,
        uint256 _payment,
        bytes32 _id,
        address _callbackAddress,
        bytes4 _callbackFunction
    ) external {
        linkToken.transferFrom(_sender, address(this), _payment);

        requests[_id] = Request({
            id: _id,
            callbackAddr: _callbackAddress,
            callbackFunctionId: _callbackFunction,
            data: new bytes32[](0)
        });

        emit OracleRequest(_id, _sender, _callbackFunction);
    }

    function fulfillOracleRequest(bytes32 _requestId, bytes32[] memory _data) external {
        Request memory req = requests[_requestId];
        require(req.callbackAddr != address(0), "Request not found");

        (bool success, ) = req.callbackAddr.call(abi.encodeWithSelector(req.callbackFunctionId, _requestId, _data));
        require(success, "Callback failed");

        delete requests[_requestId];
    }
}
