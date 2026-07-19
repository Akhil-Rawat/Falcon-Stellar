import React from 'react';
import { motion } from 'framer-motion';

const codeLines = [
  '$ npx @anshu007/falcon-api-sdk init',
  'Need to install the following packages:',
  '@anshu007/falcon-api-sdk@1.0.1',
  'Ok to proceed? (y) y',
  '',
  '🦅 Falcon API SDK Setup',
  'Monetize your Express.js APIs with Stellar blockchain payments',
  '',
  '? Which payment mode would you like to use? Pay-per-User',
  '? Your Stellar wallet address (to receive payments):',
  'GCXCAQEURH7OZ323SV65RFTXURU47IDOG4KBC72NXSBQVS3ACEMA7DFW',
  '? API name: Open-Ai',
  '? Price per API call (in XLM): 5',
  '',
  '✅ Configuration complete!',
];

const NextSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 md:px-20">
      
      {/* 🔹 OUTER WRAPPER CARD */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="
          max-w-7xl w-full
          rounded-3xl
          bg-white/85
          backdrop-blur-md
          border border-sky-100
          shadow-xl
          p-10 md:p-16
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* 🔹 LEFT CONTENT */}
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-[#047CD2] mb-6 leading-tight">
              Build with real control.
            </h2>

            <p className="text-lg md:text-xl text-slate-700 mb-10 leading-relaxed max-w-xl">
              Launch application-specific blockchains with modular architecture,
              native interoperability, and production-ready tooling.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Modular by default
                </h3>
                <p className="text-gray-600">
                  Add only what you need — nothing more.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Interchain native
                </h3>
                <p className="text-gray-600">
                  Communicate securely with other chains via IBC.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Built for production
                </h3>
                <p className="text-gray-600">
                  Used by real applications at scale.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 🔹 RIGHT SIDE — CODE CARD */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="relative h-[420px] w-full rounded-2xl bg-[#0b1020] border border-white/10 shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-gray-400">terminal.ts</span>
            </div>

            {/* Code */}
            <div className="p-5 font-mono text-sm text-gray-200 space-y-1">
              {codeLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: i * 0.35,
                    duration: 0.3,
                  }}
                >
                  <span className="text-gray-500">$</span>{' '}
                  <span>{line}</span>
                </motion.div>
              ))}

              {/* Cursor */}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block ml-1"
              >
                ▍
              </motion.span>
            </div>

            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
};

export default NextSection;
