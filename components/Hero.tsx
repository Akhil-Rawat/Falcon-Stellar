import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Spline from "@splinetool/react-spline";
import BackgroundEffects from "./BackgroundEffects";
import FloatingPlanets from "./FloatingPlanets";

const sceneUrl = new URL("../assets/scene-clean.splinecode", import.meta.url).href;

const Hero: React.FC = () => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [showSpline, setShowSpline] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseOffset({
        x: (e.clientX - window.innerWidth / 2) * 0.01,
        y: (e.clientY - window.innerHeight / 2) * 0.01,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const element = document.querySelector(".spline-container");
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowSpline(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20 overflow-hidden">
      <BackgroundEffects />
      <FloatingPlanets mouseOffset={mouseOffset} />
      <div className="absolute inset-0 -z-10 overflow-hidden min-h-[720px]">
        <div className="spline-container absolute inset-0 w-full h-full opacity-80 pointer-events-none">
          {showSpline && (
            <Spline
              scene={sceneUrl}
              className="w-full h-full"
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/10 to-slate-950/70" />
      </div>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl relative z-10"
      >
        <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-extrabold tracking-tight text-gray-900 mb-10 leading-[0.85] selection:bg-gray-300">
          Pay-Per-Call <br />
          <motion.span
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-100 to-[#9be4c8] bg-[length:200%_auto]"
          >
            SDKs for APIs
          </motion.span>
        </h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
        >
          Charge per call, not per month. Turn any API into a paid API with one
          line of code. We handle payments, verification, and access control at
          the HTTP layer so you can focus on building your product.
        </motion.p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-[#047CD2] to-[#0ea879] text-white font-semibold rounded-full hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#047CD2]/20">
            Get Started
          </button>
          <button className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all backdrop-blur">
            Explore Ecosystem
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 opacity-70"
      >
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
