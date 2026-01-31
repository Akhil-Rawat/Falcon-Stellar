import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
import { Horizon, TransactionBuilder, Asset, Networks, Operation } from 'stellar-sdk';

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
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [txHashInput, setTxHashInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [apiResult, setApiResult] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [activeTab, setActiveTab] = useState<'pay' | 'hash'>('pay');

    // Fetch APIs from backend on mount
    useEffect(() => {
        const fetchApis = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/list');
                const data = await response.json();
                setApis(data.apis || []);
            } catch (error) {
                console.error('Failed to fetch APIs:', error);
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
                headers: { 'Content-Type': 'application/json' },
            });

            if (res.status === 402) {
                const amount = res.headers.get('X-Payment-Amount');
                const asset = res.headers.get('X-Payment-Asset');
                const receiver = res.headers.get('X-Payment-Receiver');

                if (amount && receiver) {
                    setPaymentDetails({
                        apiId: api.id,
                        apiName: api.name,
                        amount,
                        asset: asset || 'XLM',
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
            console.error('API Error:', err);
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
                alert('Please install Freighter wallet!');
                return;
            }

            const { address, error } = await requestAccess();
            if (error) throw new Error(error);

            const server = new Horizon.Server('https://horizon-testnet.stellar.org');
            const account = await server.loadAccount(address);

            const tx = new TransactionBuilder(account, {
                fee: '100',
                networkPassphrase: Networks.TESTNET,
            })
                .addOperation(
                    Operation.payment({
                        destination: paymentDetails.receiver,
                        asset: Asset.native(),
                        amount: paymentDetails.amount,
                    })
                )
                .setTimeout(30)
                .build();

            const { signedTxXdr } = await signTransaction(tx.toXDR(), {
                networkPassphrase: Networks.TESTNET,
            });

            const txResult = await server.submitTransaction(
                TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET)
            );

            console.log('Transaction Submitted:', txResult.hash);

            // Auto-verify with tx hash
            await verifyPayment(txResult.hash);
        } catch (err) {
            console.error('Payment Failed:', err);
            alert('Payment failed: ' + err);
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
                    'x-payment-tx': txHash,
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok) {
                const data = await res.json();
                setApiResult(JSON.stringify(data, null, 2));
                setShowResult(true);
                setShowPaymentModal(false);
                setTxHashInput('');
                setPaymentDetails(null);
            } else {
                const error = await res.json();
                alert(error.error || 'Payment verification failed');
            }
        } catch (err) {
            console.error('Verification Error:', err);
            alert('Failed to verify payment');
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
        <div>
            <Navbar />

            <section className="min-h-screen px-6 py-24 max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold text-gray-900 mb-4"
                    >
                        API Marketplace
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                    >
                        Discover and use premium APIs. Pay per call with Stellar.
                    </motion.p>
                </div>

                {/* API Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoadingApis ? (
                        <div className="col-span-full text-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading APIs...</p>
                        </div>
                    ) : apis.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500">No APIs registered yet.</p>
                        </div>
                    ) : apis.map((api, index) => (
                        <motion.div
                            key={api.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                                {/* Category Badge */}
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
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
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
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
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        'Try API →'
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
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
                                <h3 className="text-lg font-semibold text-white">API Response</h3>
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
            </section>

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
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">💳</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Payment Required</h3>
                                <p className="text-gray-500 mt-1">HTTP 402 - Pay to use this API</p>
                            </div>

                            {/* API Info Card */}
                            <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">API</span>
                                    <span className="font-semibold text-gray-900">{paymentDetails.apiName}</span>
                                </div>

                                <div className="border-t border-gray-200" />

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Price per Call</span>
                                    <span className="font-bold text-2xl text-gray-900">
                                        {paymentDetails.amount} {paymentDetails.asset}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200" />

                                <div>
                                    <span className="text-gray-500 text-sm">Pay to Wallet</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="bg-gray-200 px-3 py-2 rounded-lg text-sm font-mono flex-1 truncate">
                                            {truncateAddress(paymentDetails.receiver)}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(paymentDetails.receiver)}
                                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                            title="Copy full address"
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setActiveTab('pay')}
                                    className={`flex-1 py-2 rounded-full font-medium transition-colors ${activeTab === 'pay'
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Pay Now
                                </button>
                                <button
                                    onClick={() => setActiveTab('hash')}
                                    className={`flex-1 py-2 rounded-full font-medium transition-colors ${activeTab === 'hash'
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    I Already Paid
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'pay' ? (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={handlePayWithFreighter}
                                    disabled={isPaying}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPaying ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <span>🚀</span> Pay with Freighter
                                        </>
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
                                        {isLoading ? 'Verifying...' : 'Verify & Continue'}
                                    </button>
                                </motion.div>
                            )}

                            {/* Cancel */}
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setTxHashInput('');
                                    setActiveTab('pay');
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
