// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VoteToken is ERC20 {
    address public minter;

    // Simple delegation tracking
    mapping(address => address) public delegates;
    mapping(address => uint256) public votingPower;

    constructor() ERC20("Voting Token", "VOTE") {
        minter = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Only minter can mint");
        _mint(to, amount);
        // Update voting power
        _updateVotingPower(address(0), to, amount);
    }

    function setMinter(address newMinter) external {
        require(msg.sender == minter, "Only minter can set new minter");
        minter = newMinter;
    }

    function delegate(address delegatee) external {
        address currentDelegate = delegates[msg.sender];
        delegates[msg.sender] = delegatee;

        _moveDelegates(currentDelegate, delegatee, balanceOf(msg.sender));
    }

    function getPastVotes(address account, uint256) public view returns (uint256) {
        // Simplified implementation - just returns current voting power
        return votingPower[account];
    }

    function _updateVotingPower(address from, address to, uint256 amount) internal {
        if (from != address(0)) {
            address delegateeFrom = delegates[from];
            if (delegateeFrom == address(0)) {
                delegateeFrom = from;
            }
            votingPower[delegateeFrom] -= amount;
        }

        if (to != address(0)) {
            address delegateeTo = delegates[to];
            if (delegateeTo == address(0)) {
                delegateeTo = to;
            }
            votingPower[delegateeTo] += amount;
        }
    }

    function _moveDelegates(address from, address to, uint256 amount) internal {
        if (from != to && amount > 0) {
            if (from != address(0)) {
                votingPower[from] -= amount;
            }
            if (to != address(0)) {
                votingPower[to] += amount;
            }
        }
    }

    function _update(address from, address to, uint256 amount) internal virtual override {
        super._update(from, to, amount);
        _updateVotingPower(from, to, amount);
    }
}
