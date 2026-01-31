import React from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl"
      >
        <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-extrabold tracking-tight text-gray-900 mb-10 leading-[0.85] selection:bg-gray-300">
          Build on the <br />
          <motion.span 
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400 bg-[length:200%_auto]"
          >
            Interchain.
          </motion.span>
        </h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-lg md:text-xl text-black max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
        >
          Reduce costs, scale effortlessly, and make your business come alive. 
          Hundreds of companies use Cosmos SDK to build fast, secure blockchain applications.
        </motion.p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95">
            Get Started
          </button>
          <button className="px-8 py-4 bg-transparent border border-gray-300 text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all">
            Explore Ecosystem
          </button>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400 opacity-70"
      >
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-500 to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
