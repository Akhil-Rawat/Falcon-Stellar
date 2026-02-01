import React from "react";
import { motion } from "framer-motion";

interface PlanetProps {
  size: number;
  color: string;
  top: string;
  left: string;
  blur?: boolean;
  mouseOffset: { x: number; y: number };
  parallaxFactor: number;
  delay?: number;
  icon?: string;
}

const Planet: React.FC<PlanetProps> = ({
  size,
  color,
  top,
  left,
  blur,
  mouseOffset,
  parallaxFactor,
  delay = 0,
  icon,
}) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: mouseOffset.x * parallaxFactor,
        y: mouseOffset.y * parallaxFactor,
      }}
      transition={{
        scale: { duration: 1, delay },
        opacity: { duration: 1, delay },
        x: { type: "spring", stiffness: 50, damping: 20 },
        y: { type: "spring", stiffness: 50, damping: 20 },
      }}
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        zIndex: parallaxFactor > 1.5 ? 20 : 5,
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 5 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`relative w-full h-full rounded-full overflow-hidden ${
          blur ? "blur-[2px]" : ""
        }`}
        style={{
          background: color,
          boxShadow: `
            inset -${size / 6}px -${size / 6}px ${size / 2}px rgba(0,0,0,0.25),
            0 20px 50px rgba(15,23,42,0.25)
          `,
        }}
      >
        {/* Soft light */}
        <div className="absolute top-[18%] left-[20%] w-[30%] h-[30%] bg-white/25 rounded-full blur-[14px]" />

        {/* ✅ IMAGE — CLEAR & ORIGINAL */}
        {icon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={icon} alt="" className="w-1/2 h-1/2 object-contain" />
          </div>
        )}

        {/* subtle texture */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]" />
      </motion.div>
    </motion.div>
  );
};

const FloatingPlanets: React.FC<{ mouseOffset: { x: number; y: number } }> = ({
  mouseOffset,
}) => {
  const planets = [
    {
      size: 120,
      color: "linear-gradient(135deg, #9b8fae 0%, #475569 100%)",
      top: "15%",
      left: "10%",
      parallaxFactor: 1.2,
      delay: 0.1,
    },
    {
      size: 160,
      color: "linear-gradient(135deg, #64748b 0%, #334155 100%)",
      top: "50%",
      left: "5%",
      parallaxFactor: 2.2,
      delay: 0.3,
      icon: "https://cryptologos.cc/logos/stellar-xlm-logo.png?v=040",
    },
    {
      size: 60,
      color: "linear-gradient(135deg, #d3c7e7 0%, #64748b 100%)",
      top: "65%",
      left: "42%",
      parallaxFactor: 1.5,
      delay: 0.5,
    },
    {
      size: 90,
      color: "linear-gradient(135deg, #cbd5f5 0%, #94a3b8 100%)",
      top: "5%",
      left: "88%",
      parallaxFactor: 0.8,
      delay: 0.7,
      blur: true,
    },
    {
      size: 140,
      color: "linear-gradient(135deg, #475569 0%, #ddcff2 100%)",
      top: "25%",
      left: "78%",
      parallaxFactor: 1.8,
      delay: 0.2,
      icon: "https://cryptologos.cc/logos/stellar-xlm-logo.png?v=040",
    },
    {
      size: 80,
      color: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
      top: "75%",
      left: "85%",
      parallaxFactor: 2.5,
      delay: 0.4,
      icon: "https://cryptologos.cc/logos/stellar-xlm-logo.png?v=040",
    },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none">
      {planets.map((p, i) => (
        <Planet key={i} {...p} mouseOffset={mouseOffset} />
      ))}
    </div>
  );
};

export default FloatingPlanets;

