"use client";

import { useState } from "react";
import { ethers } from "ethers";


const FAUCET_CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const ADMIN_PRIVATE_KEY = process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY || "";
const NEXT_PUBLIC_ALCHEMY_RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || "";

export default function Faucet() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  let isProcessing = false; // Global flag

  const handleWithdraw = async () => {
    if (isProcessing) {
      setMessage("Please wait for the current transaction to complete.");
      return;
    }
  
    isProcessing = true;
    setLoading(true);
    setMessage("Processing withdrawal...");
  
    try {
      const provider = new ethers.JsonRpcProvider(NEXT_PUBLIC_ALCHEMY_RPC_URL);
      const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
      const contract = new ethers.Contract(
        FAUCET_CONTRACT,
        ["function withdraw(address recipient) external"],
        wallet
      );
  
      const nonce = await provider.getTransactionCount(wallet.address, "latest");
  
      const tx = await contract.withdraw(recipient, { nonce });
      await tx.wait();
  
      setMessage(`Withdrawal successful! Tx: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setMessage("Transaction failed. Check console for details.");
    } finally {
      setLoading(false);
      isProcessing = false;
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-r from-[#ff5005] to-[#f79c11] text-white p-6">
    <div className="w-full max-w-md bg-black bg-opacity-40 p-6 rounded-xl shadow-lg flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-white text-center">CBTC Faucet</h1>
      <input
        type="text"
        placeholder="Enter wallet address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full max-w-sm p-3 text-white bg-gray-800 border border-gray-700 rounded-lg"
      />
      <button
        onClick={handleWithdraw}
        className="w-full max-w-sm bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
        disabled={loading}
      >
        {loading ? "Processing..." : "Withdraw CBTC"}
      </button>
      {message && (
        <p className="w-full max-w-sm p-3 text-center text-wrap text-green-400 bg-gray-900 rounded-lg">
          {message}
        </p>
      )}
    </div>
  </div>
  );
}