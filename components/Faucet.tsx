"use client";

import { useState } from "react";
import { ethers } from "ethers";


const FAUCET_CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const ADMIN_PRIVATE_KEY = process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY || "";
const NEXT_PUBLIC_ALCHEMY_RPC_UR = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || "";

export default function Faucet() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleWithdraw = async () => {
    console.log("Contract address: ", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
    console.log("Admin private key: ", process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY);
    console.log("Infura RPC URL: ", process.env.NEXT_PUBLIC_INFURA_RPC_URL);
    if (!FAUCET_CONTRACT || !ADMIN_PRIVATE_KEY || !NEXT_PUBLIC_ALCHEMY_RPC_UR) {
      setMessage("Missing environment variables.");
      return;
    }
    if (!ethers.isAddress(recipient)) {
      setMessage("Invalid wallet address.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Processing withdrawal...");

      // Connect to blockchain with admin private key
      const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_ALCHEMY_RPC_UR);
      const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
      const contract = new ethers.Contract(
        FAUCET_CONTRACT,
        [
          "function withdraw(address recipient) external"
        ],
        wallet
      );

      // Send withdrawal transaction
      const tx = await contract.withdraw(recipient);
      await tx.wait();

      setMessage(`Withdrawal successful! Tx: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setMessage("Transaction failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#ff5005] to-[#f79c11] text-white p-4">
<h1 className="text-3xl font-bold text-white mb-4">CBTC Faucet</h1>
      <input
        type="text"
        placeholder="Enter wallet address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="mb-4 p-2 text-white bg-gray-800 rounded w-80"
      />
      <button
        onClick={handleWithdraw}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
        disabled={loading}
      >
        {loading ? "Processing..." : "Withdraw CBTC"}
      </button>
      {message && <p className="mt-4 text-lg text-green-400 bg-gray-800">{message}</p>}
    </div>
  );
}