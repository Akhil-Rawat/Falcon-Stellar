import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  isConnected,
  requestAccess,
  signTransaction,
  getAddress,
} from "@stellar/freighter-api";
import {
  Horizon,
  TransactionBuilder,
  Asset,
  Networks,
  Operation,
} from "stellar-sdk";
import BackgroundEffects from "../components/BackgroundEffects";
import FloatingPlanets from "../components/FloatingPlanets";

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

interface PrepaidAPI {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  price: number;
  category: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const PrepaidMarketplace: React.FC = () => {
  const [userWallet, setUserWallet] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [fundAmount, setFundAmount] = useState<string>("10");
  const [isFunding, setIsFunding] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCallingApi, setIsCallingApi] = useState(false);
  const [escrowWallet, setEscrowWallet] = useState<string>("");

  // Prepaid APIs list
  const prepaidApis: PrepaidAPI[] = [
    {
      id: "falcone-analyze",
      name: "Falcone Analyzer",
      description: "Advanced text analysis with AI-powered sentiment detection",
      endpoint: `${API_BASE_URL}/api/prepaid/analyze`,
      price: 10,
      category: "AI",
    },
    {
      id: "image-recognition",
      name: "Image Recognition",
      description:
        "Computer vision API for object detection and classification",
      endpoint: `${API_BASE_URL}/api/prepaid/vision`,
      price: 5,
      category: "AI",
    },
    {
      id: "weather-premium",
      name: "Weather Pro",
      description: "Real-time weather data with 15-day forecasts",
      endpoint: `${API_BASE_URL}/api/prepaid/weather`,
      price: 2,
      category: "Data",
    },
    {
      id: "crypto-prices",
      name: "Crypto Prices",
      description: "Live cryptocurrency prices and market data",
      endpoint: `${API_BASE_URL}/api/prepaid/crypto`,
      price: 3,
      category: "Finance",
    },
    {
      id: "translation-api",
      name: "Neural Translate",
      description: "Multi-language translation powered by neural networks",
      endpoint: `${API_BASE_URL}/api/prepaid/translate`,
      price: 1,
      category: "AI",
    },
    {
      id: "email-validator",
      name: "Email Verification",
      description: "Validate email addresses and check deliverability",
      endpoint: `${API_BASE_URL}/api/prepaid/email-check`,
      price: 0.5,
      category: "Utility",
    },
  ];

  // Fetch escrow info on mount
  useEffect(() => {
    fetchEscrowInfo();
  }, []);

  // Connect wallet and fetch balance
  useEffect(() => {
    const connectWallet = async () => {
      try {
        const connected = await isConnected();
        if (connected) {
          const { address } = await getAddress();
          setUserWallet(address);
          await fetchBalance(address);
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    };
    connectWallet();
  }, []);

  const fetchEscrowInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/escrow/info`);
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await response.json();
        if (data.success) setEscrowWallet(data.escrowPublicKey);
      } else {
        const text = await response.text();
        console.warn("Non-JSON escrow/info response:", text);
      }
    } catch (error) {
      console.error("Failed to fetch escrow info:", error);
    }
  };

  const fetchBalance = async (userId: string) => {
    setIsLoadingBalance(true);
    try {
      const response = await fetch(`${API_BASE_URL}/escrow/balance/${userId}`);
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await response.json();
        if (data.success) setBalance(data.balance);
      } else {
        const text = await response.text();
        console.warn("Non-JSON escrow/balance response:", text);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const connected = await isConnected();
      if (!connected) {
        await requestAccess();
      }
      const { address } = await getAddress();
      setUserWallet(address);
      await fetchBalance(address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleFundEscrow = async () => {
    if (!userWallet || !escrowWallet) {
      setFormError("Please connect your wallet first.");
      return;
    }

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError("Enter a valid fund amount greater than 0.");
      return;
    }

    setFormError(null);
    setIsFunding(true);
    try {
      // Create Stellar payment transaction
      const server = new Horizon.Server("https://horizon-testnet.stellar.org");
      const sourceAccount = await server.loadAccount(userWallet);

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: escrowWallet,
            asset: Asset.native(),
            amount: fundAmount,
          }),
        )
        .setTimeout(30)
        .build();

      // Sign with Freighter
      const { signedTxXdr } = await signTransaction(transaction.toXDR(), {
        networkPassphrase: Networks.TESTNET,
      });

      // Submit to Stellar
      const signedTx = TransactionBuilder.fromXDR(
        signedTxXdr,
        Networks.TESTNET,
      );
      const result = await server.submitTransaction(signedTx);

      console.log("Transaction Submitted:", result.hash);

      // Record prepayment on backend
      const response = await fetch(`${API_BASE_URL}/escrow/fund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userWallet,
          txHash: result.hash,
          amount: parseFloat(fundAmount),
        }),
      });

      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          setBalance(data.newBalance);
          setShowFundModal(false);
          setFormError(null);
          alert(`✅ Successfully funded ${fundAmount} XLM! New balance: ${data.newBalance} XLM`);
        } else {
          setFormError(data.error || "Failed to record prepayment");
        }
      } else {
        const text = await response.text();
        setFormError(text || "Unexpected response from escrow/fund");
      }
    } catch (error: any) {
      console.error("Funding error:", error);
      setFormError(`❌ Failed to fund escrow: ${error.message}`);
    } finally {
      setIsFunding(false);
    }
  };

  const handleCallApi = async (api: PrepaidAPI) => {
    if (!userWallet) {
      alert("Please connect your wallet first");
      return;
    }

    if (balance < api.price) {
      alert(
        `❌ Insufficient balance! You need ${api.price} XLM but have ${balance} XLM`,
      );
      setShowFundModal(true);
      return;
    }

    setIsCallingApi(true);
    setApiResult(null);
    setShowResult(false);

    try {
      const response = await fetch(api.endpoint, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userWallet,
        },
      });

      const ct = response.headers.get("content-type") || "";
      if (response.status === 402) {
        if (ct.includes("application/json")) {
          const errorData = await response.json();
          setFormError(`${errorData.error}\nRemaining balance: ${errorData.remainingBalance} XLM`);
        } else {
          const text = await response.text();
          setFormError(text || "Insufficient balance");
        }
        await fetchBalance(userWallet);
      } else if (response.ok) {
        if (ct.includes("application/json")) {
          const data = await response.json();
          setApiResult(JSON.stringify(data, null, 2));
          setShowResult(true);
          setBalance(data.remainingBalance || balance - api.price);
        } else {
          const text = await response.text();
          setApiResult(text);
          setShowResult(true);
        }
      }
    } catch (error: any) {
      console.error("API call error:", error);
      setFormError(`❌ Error calling API: ${error.message}`);
    } finally {
      setIsCallingApi(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <BackgroundEffects />
      <FloatingPlanets mouseOffset={{ x: 0, y: 0 }} />

      <div className="relative z-10">
        {/* SDK Advertisement Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 md:px-20 pt-32">
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-7xl w-full rounded-3xl bg-white/85 backdrop-blur-md border border-sky-100 shadow-xl p-10 md:p-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ x: -60, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl md:text-6xl font-extrabold text-[#047CD2] mb-6 leading-tight">
                  Build Prepaid APIs
                </h2>
                <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed max-w-xl">
                  Create prepaid escrow-based APIs with our SDK. Users fund
                  once, consume until balance depletes.
                </p>
                <p className="text-base text-gray-600 mb-10">
                  Try our SDK for escrow-based API monetization with marketplace
                  auto-registration!
                </p>
                <motion.a
                  href="https://www.npmjs.com/package/@anshu007/falcone-sdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block bg-gradient-to-r from-[#047CD2] to-[#0ea879] text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all"
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
                      @anshu007/falcon-api-sdk@1.0.3
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
                      <span className="text-white">Escrow</span>
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
                    <div className="text-gray-300 mb-2">
                      ? Price per API call (in XLM):{" "}
                      <span className="text-white">10</span>
                    </div>
                    <div className="text-gray-300 mb-2">
                      ? Register this API on the marketplace so users can
                      discover it? <span className="text-white">Yes</span>
                    </div>
                    <div className="text-gray-300 mb-2">
                      ? API description (for marketplace):{" "}
                      <span className="text-white">desc.</span>
                    </div>
                    <div className="text-gray-300 mb-4">
                      ? API endpoint URL (e.g., http://localhost:3000/api/...):{" "}
                      <span className="text-white">
                        (http://localhost:3000/api/Open-Ai)
                      </span>
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

        <div className="container mx-auto px-6 py-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-1 w-12 bg-gray-900"></div>
              <span className="text-sm font-bold tracking-widest text-gray-500 uppercase">
                Escrow-Based APIs
              </span>
            </div>
            <h1 className="text-6xl font-black text-[#047CD2] mb-6 leading-tight">
              Prepaid Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
              Fund your escrow wallet once. Call APIs until your balance runs
              out. Simple, efficient, transparent.
            </p>
          </motion.div>

          {/* Wallet & Balance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-6xl mx-auto mb-16"
          >
            <div className="bg-white/90 rounded-3xl shadow-2xl p-10 border border-sky-100">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Wallet Connection */}
                <div>
                  <h3 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">
                    Wallet Status
                  </h3>
                  {userWallet ? (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-300">
                      <p className="text-sm text-gray-600 mb-1">Connected</p>
                      <p className="font-mono text-xs text-gray-800 break-all">
                        {userWallet}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectWallet}
                      className="w-full bg-gradient-to-r from-[#047CD2] to-[#0ea879] text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Connect Freighter Wallet
                    </button>
                  )}
                </div>

                {/* Balance Display */}
                <div>
                  <h3 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">
                    Available Balance
                  </h3>
                  <div className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl p-6 border border-sky-100">
                    {isLoadingBalance ? (
                      <p className="text-gray-500">Loading...</p>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-[#047CD2]">
                          {balance.toFixed(2)} XLM
                        </p>
                        <button
                          onClick={() => setShowFundModal(true)}
                          className="mt-2 text-sm text-[#047CD2] hover:text-[#035f9f] font-semibold"
                        >
                          + Add Funds
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Escrow Info */}
              {escrowWallet && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">
                    Escrow Address
                  </p>
                  <p className="font-mono text-xs text-gray-800 bg-gray-100 p-4 rounded-xl break-all">
                    {escrowWallet}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* API Cards Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-gray-900"></div>
              <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase">
                Available APIs
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prepaidApis.map((api, index) => (
                <motion.div
                  key={api.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group bg-white/90 rounded-2xl shadow-lg p-8 border border-sky-100 hover:shadow-2xl hover:border-[#047CD2]/40 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold tracking-widest bg-sky-50 text-[#047CD2] px-3 py-1.5 rounded-lg uppercase">
                      {api.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-[#047CD2] mb-3 group-hover:text-[#035f9f] transition-colors">
                    {api.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {api.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {api.price} XLM
                      </p>
                      <p className="text-xs text-gray-500">per call</p>
                    </div>
                    <button
                      onClick={() => handleCallApi(api)}
                      disabled={isCallingApi || !userWallet}
                      className="bg-gradient-to-r from-[#047CD2] to-[#0ea879] text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isCallingApi ? "⏳" : "Call API"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Fund Modal */}
          <AnimatePresence>
            {showFundModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowFundModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full border border-sky-100"
                >
                  <h2 className="text-3xl font-black text-[#047CD2] mb-8">
                    Fund Wallet
                  </h2>

                  <div className="mb-6">
                    {formError && (
                      <div className="mb-4 text-sm text-red-600">{formError}</div>
                    )}
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount (XLM)
                    </label>
                    <input
                      type="number"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-[#047CD2] focus:border-transparent"
                      placeholder="10"
                      min="0.1"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Current balance: {balance.toFixed(2)} XLM
                    </p>
                  </div>

                  <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                      ℹ️ Funds will be sent to the escrow wallet and credited to
                      your account. You can then use them to call any prepaid
                      API.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowFundModal(false)}
                      className="flex-1 bg-sky-50 text-[#047CD2] py-3 px-6 rounded-lg font-semibold hover:bg-sky-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFundEscrow}
                      disabled={isFunding || !userWallet || !(parseFloat(fundAmount) > 0)}
                      className="flex-1 bg-gradient-to-r from-[#047CD2] to-[#0ea879] text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                      {isFunding ? "Processing..." : "Fund Now"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Modal */}
          <AnimatePresence>
            {showResult && apiResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowResult(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full max-h-[80vh] overflow-auto"
                >
                  <h2 className="text-3xl font-black text-[#047CD2] mb-6">
                    API Response
                  </h2>
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-auto text-sm">
                    {apiResult}
                  </pre>
                  <button
                    onClick={() => setShowResult(false)}
                    className="mt-6 w-full bg-gradient-to-r from-[#047CD2] to-[#0ea879] text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PrepaidMarketplace;
