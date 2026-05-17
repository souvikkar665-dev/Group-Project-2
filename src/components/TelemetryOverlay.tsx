'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Activity, Thermometer, Wind } from 'lucide-react';
import { useCelestialStore } from '../store/useCelestialStore';

// Cyberpunk glitch variants for text entrances
const glitchVariants = {
  hidden: { opacity: 0, x: -10, filter: 'blur(5px)' },
  visible: { 
    opacity: 1, 
    x: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.3, type: 'spring', stiffness: 200 } 
  },
  exit: { opacity: 0, x: 10, filter: 'blur(5px)' }
};

export default function TelemetryOverlay() {
  const { currentFrameIndex, activePlanet, isTransitioning, telemetryData, setTelemetryData } = useCelestialStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/telemetry?planet=${activePlanet}`);
        if (res.ok) {
          const data = await res.json();
          setTelemetryData(data);
        }
      } catch (err) {
        console.error("Failed to fetch telemetry data", err);
      }
    };
    
    if (!isTransitioning) {
      fetchData();
      // Poll for live micro-fluctuations every 2 seconds
      interval = setInterval(fetchData, 2000);
    }
    
    return () => clearInterval(interval);
  }, [activePlanet, isTransitioning, setTelemetryData]);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8 font-mono">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div className="glass-panel px-6 py-4 flex flex-col gap-1 overflow-hidden min-w-[250px]">
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500">Target Designation</span>
          <AnimatePresence mode="wait">
            <motion.h1 
              key={activePlanet}
              variants={glitchVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-4xl font-black tracking-widest neon-text-cyan m-0"
            >
              {activePlanet}
            </motion.h1>
          </AnimatePresence>
          {isTransitioning ? (
            <span className="text-sm neon-text-orange mt-1 animate-pulse">TRAJECTORY CALCULATION...</span>
          ) : (
            <span className="text-sm text-green-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              ORBIT STABLE
            </span>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-4 flex gap-6"
        >
          <div className="flex flex-col items-end">
            <Activity size={18} className="text-[var(--accent-orange)] mb-1" />
            <span className="text-xs text-gray-500 font-bold">STATUS</span>
            <span className={`font-bold text-sm ${isTransitioning ? 'text-yellow-400' : 'text-green-400'}`}>
              {isTransitioning ? 'WARPING' : 'NOMINAL'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <Compass size={18} className="text-[var(--accent-cyan)] mb-1" />
            <span className="text-xs text-gray-500 font-bold">FRM_IDX</span>
            <span className="font-bold text-sm">{currentFrameIndex.toString().padStart(4, '0')}</span>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div 
            key={activePlanet + '-data'}
            variants={glitchVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex justify-between items-end mb-20"
          >
            <div className="glass-panel p-6 flex flex-col gap-4 min-w-[320px]">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-xs text-gray-500 font-bold tracking-wider">CLASS</span>
                <span className="text-sm neon-text-cyan">{telemetryData.type}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-xs text-gray-500 font-bold tracking-wider flex items-center gap-2">
                  <Thermometer size={14}/> MEAN TEMP
                </span>
                <span className="text-sm">{telemetryData.temp}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold tracking-wider flex items-center gap-2">
                  <Wind size={14}/> EST. MASS
                </span>
                <span className="text-sm">{telemetryData.mass}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
