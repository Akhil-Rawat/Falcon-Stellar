import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import BackgroundEffects from './components/BackgroundEffects';
import FloatingPlanets from './components/FloatingPlanets';

import Home from './pages/Home';
import Playground from './pages/Playground';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';

const App: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden">
      {/* 🔹 GLOBAL BACKGROUND */}
      <BackgroundEffects />

      {/* 🔹 GLOBAL FLOATING PLANETS */}
      <FloatingPlanets mouseOffset={mousePosition} />

      {/* 🔹 CONTENT */}
      <div className="relative z-10">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </div>

      {/* 🔹 BOTTOM FADE */}
      <div className="fixed bottom-0 left-0 w-full h-64 bg-gradient-to-t from-white to-transparent pointer-events-none z-0" />
    </div>
  );
};

export default App;
