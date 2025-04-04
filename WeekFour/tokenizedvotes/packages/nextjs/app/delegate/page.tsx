"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const DelegatePage = () => {
    const { address } = useAccount();
    const [delegateAddress, setDelegateAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { data: voteToken } = useScaffoldContract({
        contractName: "VoteToken",
    });

    const { writeContractAsync } = useScaffoldWriteContract({
        contractName: "VoteToken",
    });

    const handleDelegate = async () => {
        if (!writeContractAsync || !address || !delegateAddress) return;

        try {
            setIsLoading(true);

            const tx = await writeContractAsync({
                functionName: "delegate",
                args: [delegateAddress],
            });

            notification.success("Votes delegated successfully!");
            setDelegateAddress("");
        } catch (error) {
            console.error("Error delegating votes:", error);
            notification.error("Failed to delegate votes");
        } finally {
            setIsLoading(false);
        }
    };

    if (!address) {
        return (
            <div className="flex flex-col items-center gap-4 py-10">
                <h1 className="text-3xl font-bold">Delegate Voting Power</h1>
                <p>Please connect your wallet to continue</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 py-10 px-5">
            <h1 className="text-3xl font-bold">Delegate Your Voting Power</h1>

            <div className="card w-full max-w-2xl bg-base-200 shadow-xl p-6">
                <p className="mb-6">
                    Delegating your voting power allows another address to vote on your behalf. You can delegate your votes
                    without transferring your tokens.
                </p>

                <div className="form-control w-full mb-6">
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

                <button className="btn btn-primary w-full" onClick={handleDelegate} disabled={isLoading || !delegateAddress}>
                    {isLoading ? <span className="loading loading-spinner"></span> : "Delegate Votes"}
                </button>
            </div>
        </div>
    );
};

export default DelegatePage;
