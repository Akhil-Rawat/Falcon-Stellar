import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll } from "framer-motion";
import { requestAccess, getAddress } from "@stellar/freighter-api";
import OLogo from "../assets/O.png";

const Navbar: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  // Track scroll position for navbar background
  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  const handleConnectWallet = async () => {
    try {
      await requestAccess();
      const { address } = await getAddress();
      setAddress(address);
    } catch {
      console.log("User cancelled or wallet locked");
    }
  };

  const navItems = [
    { label: "API Market", href: "/marketplace" },
    { label: "Prepaid APIs", href: "/prepaid" },
    { label: "SDK Docs", href: "/sdk-docs" },
  ];

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className={`
        fixed top-0 left-0 w-full z-50 px-6 py-4 md:px-12
        flex items-center justify-between
        transition-all duration-300
        ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-200"
            : "bg-transparent"
        }
      `}
    >
      {/* LOGO - Links to home */}
      <Link to="/">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 cursor-pointer transition-colors duration-300"
        >
          <span
            className={`text-2xl font-bold tracking-widest uppercase ${scrolled ? "text-[#047CD2]" : "text-white"}`}
          >
            FALC
            <img
              src={OLogo}
              alt=""
              className="inline-block h-8 w-8 mx-1 object-contain align-middle"
            />
            N
          </span>
        </motion.div>
      </Link>

      {/* MIDDLE NAVIGATION ITEMS */}
      <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.label} to={item.href} className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-4 py-2 rounded-lg
                  font-semibold text-sm
                  transition-all duration-200
                  ${
                    isActive
                      ? "text-gray-900 bg-gray-100"
                      : scrolled
                        ? "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        : "text-gray-800 hover:text-gray-900 hover:bg-white/50"
                  }
                `}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#047CD2]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* CONNECT / CONNECTED BUTTON */}
      <motion.button
        onClick={handleConnectWallet}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          hidden md:flex items-center gap-2
          px-6 py-3 rounded-full
          font-bold text-sm
          transition-all duration-300
          ${
            address
              ? scrolled
                ? "bg-gradient-to-r from-[#047CD2] to-[#0ea879] text-white border-2 border-transparent shadow-lg"
                : "bg-gradient-to-r from-[#047CD2] to-[#0ea879] text-white border-2 border-transparent shadow-lg"
              : scrolled
                ? "bg-gradient-to-r from-[#047CD2] to-[#0ea879] text-white border-2 border-transparent shadow-lg"
                : "bg-white text-[#047CD2] border-2 border-white hover:bg-sky-50"
          }
        `}
      >
        {address ? (
          <>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            Connect Wallet
          </>
        )}
      </motion.button>

      {/* MOBILE MENU BUTTON */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`
          md:hidden p-2 rounded-lg
          transition-colors duration-300
          ${scrolled ? "text-[#047CD2] hover:bg-sky-50" : "text-white hover:bg-white/15"}
        `}
      >
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
      </motion.button>
    </motion.nav>
  );
};

export default Navbar;
