"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

function TokenAddressFromApi() {
  const [data, setData] = useState<{ result: string }>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/contract-address")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching token address:", error);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading token address from API...</p>;
  if (!data) return <p>No token address information</p>;

  return (
    <div>
      <p>Token address from API: {data.result}</p>
    </div>
  );
}

function RequestTokens(params: { address: string }) {
  const [data, setData] = useState<{ success: boolean; transactionHash?: string }>();
  const [amount, setAmount] = useState(100);
  const [isLoading, setLoading] = useState(false);

  if (isLoading) return <p>Requesting tokens from API...</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Amount of tokens"
          className="input input-bordered"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          min={1}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            setLoading(true);
            fetch("http://localhost:3001/tokens/mint", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address: params.address, amount }),
            })
              .then(res => res.json())
              .then(data => {
                setData(data);
                setLoading(false);
              })
              .catch(error => {
                console.error("Error requesting tokens:", error);
                setLoading(false);
              });
          }}
        >
          Request tokens
        </button>
      </div>

      {data && (
        <div className="mt-2">
          <p>
            {data.success
              ? `Success! Tokens minted. TX: ${data.transactionHash?.substring(0, 10)}...`
              : "Failed to mint tokens. Please try again."}
          </p>
        </div>
      )}
    </div>
  );
}

function VoteOnProposal(params: { address: string; tokenAddress: string }) {
  const [selectedProposal, setSelectedProposal] = useState<number>(0);
  const [amount, setAmount] = useState(1);
  const [isVoting, setIsVoting] = useState(false);
  const [result, setResult] = useState("");
  const [proposals, setProposals] = useState(["Proposal 1", "Proposal 2", "Proposal 3"]);

  const handleVote = async () => {
    setIsVoting(true);
    setResult("");

    try {
      // This would be implemented with ethers.js to interact with the smart contract
      // For now, we'll just simulate a successful vote
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResult(`Successfully voted ${amount} tokens for ${proposals[selectedProposal]}`);
    } catch (error) {
      console.error("Error voting:", error);
      setResult("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="card w-full bg-base-200 shadow-xl p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">Cast Your Vote</h2>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Select Proposal</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={selectedProposal}
          onChange={e => setSelectedProposal(Number(e.target.value))}
        >
          {proposals.map((proposal, index) => (
            <option key={index} value={index}>
              {proposal}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control w-full mt-2">
        <label className="label">
          <span className="label-text">Voting Power</span>
        </label>
        <input
          type="number"
          className="input input-bordered w-full"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          min={1}
        />
      </div>

      <button className="btn btn-primary mt-4" onClick={handleVote} disabled={isVoting}>
        {isVoting ? "Voting..." : "Cast Vote"}
      </button>

      {result && (
        <div className="alert mt-4">
          <span>{result}</span>
        </div>
      )}
    </div>
  );
}

function DelegateVotes(params: { address: string; tokenAddress: string }) {
  const [delegateAddress, setDelegateAddress] = useState("");
  const [isDelegating, setIsDelegating] = useState(false);
  const [result, setResult] = useState("");

  const handleDelegate = async () => {
    if (!delegateAddress) return;

    setIsDelegating(true);
    setResult("");

    try {
      // This would be implemented with ethers.js to interact with the smart contract
      // For now, we'll just simulate a successful delegation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResult(`Successfully delegated votes to ${delegateAddress.substring(0, 10)}...`);
    } catch (error) {
      console.error("Error delegating:", error);
      setResult("Failed to delegate. Please try again.");
    } finally {
      setIsDelegating(false);
    }
  };

  return (
    <div className="card w-full bg-base-200 shadow-xl p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">Delegate Your Votes</h2>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Delegate Address</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={delegateAddress}
          onChange={e => setDelegateAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <button className="btn btn-primary mt-4" onClick={handleDelegate} disabled={isDelegating || !delegateAddress}>
        {isDelegating ? "Delegating..." : "Delegate Votes"}
      </button>

      {result && (
        <div className="alert mt-4">
          <span>{result}</span>
        </div>
      )}
    </div>
  );
}

function RecentVotes() {
  const [votes, setVotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/tokens/recent-votes")
      .then(res => res.json())
      .then(data => {
        setVotes(data.votes || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching recent votes:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading recent votes...</p>;

  return (
    <div className="card w-full bg-base-200 shadow-xl p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">Recent Votes</h2>

      {votes.length === 0 ? (
        <p>No votes recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Voter</th>
                <th>Proposal</th>
                <th>Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote: any, index: number) => (
                <tr key={index}>
                  <td>
                    {vote.voter.substring(0, 6)}...{vote.voter.substring(vote.voter.length - 4)}
                  </td>
                  <td>Proposal {vote.proposal}</td>
                  <td>{vote.amount}</td>
                  <td>{new Date(vote.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ApiData(params: { address: string }) {
  const [tokenAddress, setTokenAddress] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/tokens/contract-address")
      .then(res => res.json())
      .then(data => {
        setTokenAddress(data.result);
      })
      .catch(error => {
        console.error("Error fetching token address:", error);
      });
  }, []);

  return (
    <div className="flex flex-col w-full max-w-3xl">
      <div className="card bg-primary text-primary-content p-4 mb-4">
        <h2 className="card-title">Tokenized Voting dApp</h2>
        <p className="text-sm mb-2">Token Contract: {tokenAddress ? tokenAddress : "Loading..."}</p>
        <RequestTokens address={params.address} />
      </div>

      {tokenAddress && (
        <>
          <VoteOnProposal address={params.address} tokenAddress={tokenAddress} />
          <DelegateVotes address={params.address} tokenAddress={tokenAddress} />
          <RecentVotes />
        </>
      )}
    </div>
  );
}

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Tokenized Votes</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
            {connectedAddress && <ApiData address={connectedAddress} />}
          </div>

          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              YourContract.sol
            </code>{" "}
            in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/hardhat/contracts
            </code>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
