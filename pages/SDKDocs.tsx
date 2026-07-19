import React from "react";
import { motion } from "framer-motion";
import BackgroundEffects from "../components/BackgroundEffects";
import FloatingPlanets from "../components/FloatingPlanets";

const SDKDocs: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 pt-32 px-6 pb-24">
      <BackgroundEffects />
      <FloatingPlanets mouseOffset={{ x: 0, y: 0 }} />
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-1 w-12 bg-gray-900"></div>
            <span className="text-sm font-bold tracking-widest text-gray-500 uppercase">
              Documentation
            </span>
          </div>
          <h1 className="text-6xl font-black text-[#047CD2] mb-6 leading-tight">
            SDK Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Complete guide to integrating Falcon API SDK into your applications.
          </p>
        </motion.div>

        {/* Content Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-200 space-y-10"
        >
          <section>
            <h2 className="text-3xl font-black text-[#047CD2] mb-4">
              How We Make This Work
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Falcon SDK turns payment enforcement into simple middleware. Your
              API returns HTTP 402 when unpaid, the client pays on Stellar, and
              the same request is retried with a transaction hash.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              System Flow
            </h3>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Client calls protected endpoint.</li>
              <li>Backend returns 402 with payment headers.</li>
              <li>User pays using Freighter wallet.</li>
              <li>Client retries request with x-payment-tx header.</li>
              <li>Backend verifies tx and returns API response.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Integration Example (Express)
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-2xl overflow-x-auto text-sm">
{`const express = require("express");
const { protect } = require("@anshu007/falcone-sdk");

const app = express();

app.get(
  "/api/premium",
  protect({
    price: { amount: "2", asset: "XLM" },
    receiver: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG",
  }),
  (req, res) => {
    res.json({ message: "Premium content" });
  },
);`}
            </pre>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Register Your API
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-2xl overflow-x-auto text-sm">
{`npx @anshu007/falcon-api-sdk register \\
  --name "My API" \\
  --description "Premium endpoint" \\
  --endpoint "https://my-domain.com/api/premium" \\
  --price 2 \\
  --wallet "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG" \\
  --mode pay-per-user`}
            </pre>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Escrow Mode (Prepaid)
            </h3>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>User funds escrow once using Stellar.</li>
              <li>Backend verifies tx and stores balance in MongoDB.</li>
              <li>Each API call deducts credits from balance.</li>
              <li>Response includes remaining balance.</li>
            </ol>
          </section>

          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-[#047CD2] mb-2">
              Required Environment Variables
            </h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Backend: MONGODB_URI</li>
              <li>Backend: ESCROW_PUBLIC_KEY</li>
              <li>Frontend: VITE_API_BASE_URL</li>
            </ul>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default SDKDocs;
