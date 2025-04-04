"use client";

import { useEffect, useState } from "react";
import { BytesLike } from "ethers";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const OraclePage = () => {
    const { address, isConnected } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [jobId, setJobId] = useState("29fa9aa13bf1468788b7cc4a500a45b8");
    const [payment, setPayment] = useState("0.1");
    const [url, setUrl] = useState("https://example.com/api/proposals");
    const [path, setPath] = useState("data.proposals");

    const { data: oracleConsumer } = useScaffoldContract({
        contractName: "OracleConsumer",
    });

    const { data: proposalNames } = useScaffoldReadContract({
        contractName: "OracleConsumer",
        functionName: "getProposalNames",
    });

    const { data: dataReceived } = useScaffoldReadContract({
        contractName: "OracleConsumer",
        functionName: "dataReceived",
    });

    const { writeContractAsync } = useScaffoldWriteContract({
        contractName: "OracleConsumer",
    });

    const handleRequestData = async () => {
        if (!writeContractAsync || !address) return;

        try {
            setIsLoading(true);

            // Convert jobId to bytes32 format
            const jobIdBytes = "0x" + Buffer.from(jobId).toString("hex").padEnd(64, "0");

            // Convert payment to BigInt
            const paymentWei = BigInt(parseFloat(payment) * 10 ** 18);

            const tx = await writeContractAsync({
                functionName: "requestProposalData",
                args: [jobIdBytes as BytesLike, paymentWei, url, path],
            });

            // Transaction hash is returned, but we don't need to wait for it
            // The scaffold-eth hooks already handle transaction notifications
            notification.success("Oracle request sent successfully!");
        } catch (error) {
            console.error("Error requesting data from oracle:", error);
            notification.error("Failed to request data from oracle");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center gap-4 py-10">
                <h1 className="text-3xl font-bold">Oracle Integration</h1>
                <p>Please connect your wallet to continue</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 py-10 px-5">
            <h1 className="text-3xl font-bold">Oracle Integration</h1>

            <div className="card w-full max-w-3xl bg-base-200 shadow-xl p-6">
                <h2 className="text-xl font-bold mb-4">Request Proposal Data from Oracle</h2>

                <div className="form-control w-full mb-2">
                    <label className="label">
                        <span className="label-text">Job ID</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={jobId}
                        onChange={e => setJobId(e.target.value)}
                    />
                </div>

                <div className="form-control w-full mb-2">
                    <label className="label">
                        <span className="label-text">Payment (LINK)</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={payment}
                        onChange={e => setPayment(e.target.value)}
                    />
                </div>

                <div className="form-control w-full mb-2">
                    <label className="label">
                        <span className="label-text">API URL</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                    />
                </div>

                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text">JSON Path</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={path}
                        onChange={e => setPath(e.target.value)}
                    />
                </div>

                <button
                    className="btn btn-primary w-full"
                    onClick={handleRequestData}
                    disabled={isLoading || !jobId || !payment || !url || !path}
                >
                    {isLoading ? <span className="loading loading-spinner"></span> : "Request Data from Oracle"}
                </button>
            </div>

            <div className="card w-full max-w-3xl bg-base-200 shadow-xl p-6 mt-6">
                <h2 className="text-xl font-bold mb-4">Oracle Data</h2>

                {dataReceived ? (
                    <div>
                        <p className="text-success mb-4">✅ Data has been received from the oracle</p>

                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Proposal Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proposalNames &&
                                        proposalNames.map((name: string, index: number) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{Buffer.from(name.slice(2), "hex").toString().replace(/\0+$/, "")}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <p>No data received yet. Use the form above to request data from the oracle.</p>
                )}
            </div>
        </div>
    );
};

export default OraclePage;
