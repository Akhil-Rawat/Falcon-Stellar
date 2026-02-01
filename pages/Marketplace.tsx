import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import {
  Horizon,
  TransactionBuilder,
  Asset,
  Networks,
  Operation,
} from "stellar-sdk";

// API type from backend
interface API {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  price: string;
  asset: string;
  receiver: string;
  category: string;
  owner: string;
  createdAt: string;
}

interface PaymentDetails {
  apiId: string;
  apiName: string;
  amount: string;
  asset: string;
  receiver: string;
  endpoint: string;
}

const Marketplace: React.FC = () => {
  const [apis, setApis] = useState<API[]>([]);
  const [isLoadingApis, setIsLoadingApis] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [txHashInput, setTxHashInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<"pay" | "hash">("pay");

  // Fetch APIs from backend on mount
  useEffect(() => {
    const fetchApis = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/list");
        const data = await response.json();
        setApis(data.apis || []);
      } catch (error) {
        console.error("Failed to fetch APIs:", error);
      } finally {
        setIsLoadingApis(false);
      }
    };
    fetchApis();
  }, []);

  // Step 1: Try API - Expecting 402
  const tryApi = async (api: API) => {
    setIsLoading(true);
    setApiResult(null);
    setShowResult(false);

    try {
      const res = await fetch(api.endpoint, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 402) {
        const amount = res.headers.get("X-Payment-Amount");
        const asset = res.headers.get("X-Payment-Asset");
        const receiver = res.headers.get("X-Payment-Receiver");

        if (amount && receiver) {
          setPaymentDetails({
            apiId: api.id,
            apiName: api.name,
            amount,
            asset: asset || "XLM",
            receiver,
            endpoint: api.endpoint,
          });
          setShowPaymentModal(true);
        }
      } else if (res.ok) {
        const data = await res.json();
        setApiResult(JSON.stringify(data, null, 2));
        setShowResult(true);
      }
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2a: Pay via Freighter
  const handlePayWithFreighter = async () => {
    if (!paymentDetails) return;
    setIsPaying(true);

    try {
      if (!(await isConnected())) {
        alert("Please install Freighter wallet!");
        return;
      }

      const { address, error } = await requestAccess();
      if (error) throw new Error(error);

      const server = new Horizon.Server("https://horizon-testnet.stellar.org");
      const account = await server.loadAccount(address);

      const tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: paymentDetails.receiver,
            asset: Asset.native(),
            amount: paymentDetails.amount,
          }),
        )
        .setTimeout(30)
        .build();

      const { signedTxXdr } = await signTransaction(tx.toXDR(), {
        networkPassphrase: Networks.TESTNET,
      });

      const txResult = await server.submitTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET),
      );

      console.log("Transaction Submitted:", txResult.hash);

      // Auto-verify with tx hash
      await verifyPayment(txResult.hash);
    } catch (err) {
      console.error("Payment Failed:", err);
      alert("Payment failed: " + err);
    } finally {
      setIsPaying(false);
    }
  };

  // Step 2b: Manual tx hash submission
  const handleSubmitTxHash = async () => {
    if (!txHashInput.trim() || !paymentDetails) return;
    await verifyPayment(txHashInput.trim());
  };

  // Step 3: Verify payment and get API response
  const verifyPayment = async (txHash: string) => {
    if (!paymentDetails) return;
    setIsLoading(true);

    try {
      const res = await fetch(paymentDetails.endpoint, {
        headers: {
          "x-payment-tx": txHash,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setApiResult(JSON.stringify(data, null, 2));
        setShowResult(true);
        setShowPaymentModal(false);
        setTxHashInput("");
        setPaymentDetails(null);
      } else {
        const error = await res.json();
        alert(error.error || "Payment verification failed");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      alert("Failed to verify payment");
    } finally {
      setIsLoading(false);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen">
      {/* SDK Advertisement Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-20">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-7xl w-full rounded-3xl bg-white/60 backdrop-blur-md border border-gray-300 shadow-xl p-10 md:p-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Monetize Your APIs Instantly
              </h2>
              <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed max-w-xl">
                Get pay-per-user API monetization with our SDK. Accept Stellar
                payments with just a few lines of code.
              </p>
              <p className="text-base text-gray-600 mb-10">
                Try our SDK for per-call API monetization - setup takes less
                than 2 minutes!
              </p>
              <motion.a
                href="https://www.npmjs.com/package/@anshu007/falcone-sdk"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-gradient-to-r from-gray-900 to-black text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all"
              >
                View SDK Documentation →
              </motion.a>
            </motion.div>

            {/* Right - Terminal */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                {/* Terminal Header */}
                <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-3 text-gray-400 text-sm font-mono">
                    terminal
                  </span>
                </div>

                {/* Terminal Body */}
                <div className="p-6 font-mono text-sm overflow-x-auto">
                  <div className="text-gray-300 mb-2">
                    $ npx @anshu007/falcon-api-sdk init
                  </div>
                  <div className="text-gray-400 mb-1">
                    Need to install the following packages:
                  </div>
                  <div className="text-gray-400 mb-1">
                    @anshu007/falcon-api-sdk@1.0.1
                  </div>
                  <div className="text-gray-400 mb-3">
                    Ok to proceed? (y) <span className="text-white">y</span>
                  </div>

                  <div className="text-gray-100 text-base mb-3">
                    🦅 Falcon API SDK Setup
                  </div>
                  <div className="text-gray-300 mb-4">
                    Monetize your Express.js APIs with Stellar blockchain
                    payments
                  </div>

                  <div className="text-gray-300 mb-2">
                    ? Which payment mode would you like to use?{" "}
                    <span className="text-white">Pay-per-User</span>
                  </div>
                  <div className="text-gray-300 mb-2">
                    ? Your Stellar wallet address (to receive payments):
                  </div>
                  <div className="text-white mb-2 break-all">
                    GCXCAQEURH7OZ323SV65RFTXURU47IDOG4KBC72NXSBQVS3ACEMA7DFW
                  </div>
                  <div className="text-gray-300 mb-2">
                    ? API name: <span className="text-white">Open-Ai</span>
                  </div>
                  <div className="text-gray-300 mb-4">
                    ? Price per API call (in XLM):{" "}
                    <span className="text-white">5</span>
                  </div>

                  <div className="text-gray-100 font-semibold">
                    ✅ Configuration complete!
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* API Marketplace Section */}
      <div className="px-6 py-32 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-1 w-12 bg-gray-900"></div>
            <span className="text-sm font-bold tracking-widest text-gray-500 uppercase">
              Pay-Per-Call APIs
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-black text-gray-900 mb-6 leading-tight"
          >
            API Marketplace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl leading-relaxed"
          >
            Access premium APIs instantly. Pay only for what you use with
            blockchain-powered transactions.
          </motion.p>
        </div>

        {/* API Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoadingApis ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading APIs...</p>
            </div>
          ) : apis.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No APIs registered yet.</p>
            </div>
          ) : (
            apis.map((api, index) => (
              <motion.div
                key={api.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative bg-white/80 backdrop-blur-xl border border-gray-300 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-gray-200 text-gray-900 text-xs font-semibold rounded-full mb-4">
                    {api.category}
                  </span>

                  {/* API Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {api.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {api.description}
                  </p>

                  {/* Owner Info */}
                  <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                      {api.owner[0]}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Provider</p>
                      <p className="font-semibold text-gray-900">{api.owner}</p>
                    </div>
                  </div>

                  {/* Try Button */}
                  <motion.button
                    onClick={() => tryApi(api)}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Try API →"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* API Result */}
        <AnimatePresence>
          {showResult && apiResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12 bg-gray-900 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  API Response
                </h3>
                <button
                  onClick={() => setShowResult(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <pre className="text-green-400 font-mono text-sm overflow-auto max-h-96">
                {apiResult}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && paymentDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl"
            >
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-1 w-12 bg-gray-900"></div>
                  <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                    Payment Required
                  </span>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">
                  Complete Transaction
                </h3>
                <p className="text-gray-600">
                  HTTP 402 · Blockchain payment needed
                </p>
              </div>

              {/* API Info Card */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-5 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                    API Name
                  </span>
                  <span className="font-bold text-gray-900 text-lg">
                    {paymentDetails.apiName}
                  </span>
                </div>

                <div className="border-t border-gray-300" />

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                    Price
                  </span>
                  <span className="font-black text-3xl text-gray-900">
                    {paymentDetails.amount} {paymentDetails.asset}
                  </span>
                </div>

                <div className="border-t border-gray-300" />

                <div>
                  <span className="text-xs font-bold tracking-widest text-gray-500 uppercase block mb-2">
                    Recipient Wallet
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-200 px-3 py-2 rounded-lg text-sm font-mono flex-1 truncate">
                      {truncateAddress(paymentDetails.receiver)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(paymentDetails.receiver)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copy full address"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("pay")}
                  className={`flex-1 py-2 rounded-full font-medium transition-colors ${
                    activeTab === "pay"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Pay Now
                </button>
                <button
                  onClick={() => setActiveTab("hash")}
                  className={`flex-1 py-2 rounded-full font-medium transition-colors ${
                    activeTab === "hash"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  I Already Paid
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "pay" ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handlePayWithFreighter}
                  disabled={isPaying}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-gray-900 to-black text-white font-bold rounded-full hover:from-gray-800 hover:to-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPaying ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    "Pay with Freighter"
                  )}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    value={txHashInput}
                    onChange={(e) => setTxHashInput(e.target.value)}
                    placeholder="Enter transaction hash..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                  <button
                    onClick={handleSubmitTxHash}
                    disabled={!txHashInput.trim() || isLoading}
                    className="w-full py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </button>
                </motion.div>
              )}

              {/* Cancel */}
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setTxHashInput("");
                  setActiveTab("pay");
                }}
                className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;