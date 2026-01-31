import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  requestAccess,
  getAddress,
} from '@stellar/freighter-api';

const Navbar: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      // This opens wallet ONLY if not already connected
      await requestAccess();

      const { address } = await getAddress();
      setAddress(address);
    } catch {
      console.log('User cancelled or wallet locked');
    }
  };

  const navItems = [
    { label: 'API Market', href: '/marketplace' },
    { label: 'Docs', href: '#' },
    { label: 'SDK', href: '#' },
  ];

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex items-center justify-between"
    >
      {/* LOGO */}
      <div className="text-2xl font-bold tracking-widest text-black uppercase">
        FALC<span className="text-blue-500">Ø</span>N
      </div>

      {/* MIDDLE NAVIGATION ITEMS */}
      <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
        {navItems.map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={item.href}
              className="
                px-4 py-2
                text-black
                font-semibold
                hover:text-blue-600
                transition-colors
                duration-200
              "
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* CONNECT / CONNECTED BUTTON */}
      <motion.button
        onClick={handleConnectWallet}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="
          hidden md:flex items-center gap-2
          px-6 py-3
          border-2 border-black
          rounded-full
          text-black
          font-bold
          bg-white
        "
      >
        {address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : 'Connect Wallet'}
      </motion.button>

      {/* MOBILE MENU BUTTON (Optional) */}
      <button className="md:hidden text-black">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </motion.nav>
  );
};

export default Navbar;