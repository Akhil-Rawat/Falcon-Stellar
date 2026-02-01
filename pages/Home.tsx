import React from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import NextSection from "../components/NextSection";

const apis = [
  {
    id: "ai-summary",
    name: "AI Summary",
    price: "0.0001 USDC / call",
    description: "Generate short summaries from long text.",
  },
  {
    id: "text-analyzer",
    name: "Text Analyzer",
    price: "0.00005 USDC / call",
    description: "Analyze sentiment and keywords from text.",
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Hero />
      <NextSection />

      {/* API Marketplace */}
      <section className="py-24 px-6">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          API Marketplace
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {apis.map((api) => (
            <div
              key={api.id}
              className="rounded-2xl bg-white/70 backdrop-blur border border-gray-200 p-6 shadow-sm"
            >
              <h3 className="text-2xl font-semibold text-gray-900">
                {api.name}
              </h3>
              <p className="text-gray-600 mt-2">{api.description}</p>
              <p className="mt-4 font-medium text-gray-800">{api.price}</p>

              <button
                onClick={() => navigate("/playground")}
                className="mt-6 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
              >
                Try API
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
