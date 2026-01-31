import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
import { Horizon, TransactionBuilder, Asset, Networks } from 'stellar-sdk';

const Playground: React.FC = () => {
  const [input, setInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [apiResult, setApiResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{ amount: string, destination: string, asset: string } | null>(null);

  const runApi = async () => {
    setIsLoading(true);
    try {
      // 1. First call to API (expecting 402)
      const res = await fetch('http://localhost:3001/api/analyze', {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 402) {
        // Payment Required
        const amount = res.headers.get('x-payment-amount');
        const asset = res.headers.get('x-payment-asset');
        const receiver = res.headers.get('x-payment-receiver');

        if (amount && receiver) {
          setPaymentDetails({ amount, destination: receiver, asset: asset || 'XLM' });
          setShowPayment(true);
        }
      } else if (res.ok) {
        const data = await res.json();
        setApiResult(JSON.stringify(data, null, 2));
        setShowResult(true);
      }
    } catch (err) {
      console.error("API Error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentDetails) return;

    try {
      // Check Freighter
      if (!(await isConnected())) {
        alert("Please install Freighter wallet!");
        return;
      }
      await requestAccess();

      // Build Transaction
      const server = new Horizon.Server('https://horizon-testnet.stellar.org');
      const { address, error } = await requestAccess();
      if (error) {
        throw new Error(error);
      }
      const account = await server.loadAccount(address);

      const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          {
            destination: paymentDetails.destination,
            asset: Asset.native(),
            amount: paymentDetails.amount,
          } as any // quick type fix for demo
        )
        .setTimeout(30)
        .build();

      // Sign with Freighter
      const { signedTxXdr } = await signTransaction(tx.toXDR(), { networkPassphrase: Networks.TESTNET });

      // Submit to Network
      const txResult = await server.submitTransaction(TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET));
      console.log("Transaction Submitted:", txResult.hash);

      // 2. Retry API with Payment Proof
      setShowPayment(false);
      setIsLoading(true);

      const res = await fetch('http://localhost:3001/api/analyze', {
        headers: {
          'x-payment-tx': txResult.hash,
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();
      setApiResult(JSON.stringify(data, null, 2));
      setShowResult(true);

    } catch (err) {
      console.error("Payment Failed", err);
      alert("Payment Failed: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <section className="min-h-screen px-6 py-24 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-6">
          Falcone SDK Playground
        </h1>

        {/* Input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
          className="
            w-full h-32 p-4
            border border-gray-300 rounded-lg
            text-black
            placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-black/20
          "
        />

        {/* Run Button */}
        <button
          onClick={runApi}
          disabled={isLoading}
          className="mt-6 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Run Falcone API"}
        </button>

        {/* Payment Modal */}
        {showPayment && paymentDetails && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-80 text-center">
              <h3 className="text-lg font-semibold text-black mb-4">
                This request costs {paymentDetails.amount} {paymentDetails.asset}
              </h3>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handlePayment}
                  className="px-4 py-2 bg-black text-white rounded-full"
                >
                  Pay & Continue
                </button>
                <button
                  onClick={() => setShowPayment(false)}
                  className="px-4 py-2 border border-gray-300 text-black rounded-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Result */}
        {showResult && (
          <div className="mt-10 bg-gray-100 rounded-lg p-4 font-mono text-sm text-black overflow-auto">
            <pre>
              {apiResult}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};

export default Playground;
