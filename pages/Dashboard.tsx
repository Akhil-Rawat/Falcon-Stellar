import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div>
      <Navbar />

      <section className="min-h-screen px-6 py-24 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#047CD2] mb-10">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur border p-6 rounded-xl">
            <p className="text-gray-600">Total Calls</p>
            <p className="text-3xl font-bold">12</p>
          </div>

          <div className="bg-white/70 backdrop-blur border p-6 rounded-xl">
            <p className="text-gray-600">Paid Calls</p>
            <p className="text-3xl font-bold">10</p>
          </div>

          <div className="bg-white/70 backdrop-blur border p-6 rounded-xl">
            <p className="text-gray-600">Revenue</p>
            <p className="text-3xl font-bold">0.0012 USDC</p>
          </div>
        </div>

        {/* APIs List */}
        <div className="bg-white/70 backdrop-blur border p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Your APIs</h2>
          <ul className="space-y-2 text-gray-700">
            <li>AI Summary</li>
            <li>Text Analyzer</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
