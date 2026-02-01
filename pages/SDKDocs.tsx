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
          <h1 className="text-6xl font-black text-gray-900 mb-6 leading-tight">
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
          className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-200"
        >
          <p className="text-gray-600 text-lg">Documentation coming soon...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SDKDocs;
