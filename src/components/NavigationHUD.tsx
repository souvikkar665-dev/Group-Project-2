'use client';

import React from 'react';
import gsap from 'gsap';
import { useCelestialStore } from '../store/useCelestialStore';
import manifestData from '../lib/manifest.json';

const planets = [
  'SUN',
  'MERCURY',
  'VENUS',
  'EARTH',
  'MARS',
  'JUPITER',
  'SATURN',
  'URANUS',
  'NEPTUNE'
];

export default function NavigationHUD() {
  const activePlanet = useCelestialStore((state) => state.activePlanet);

  const handleNavigate = (targetPlanet: string) => {
    // Find the starting frame index of the target planet in the manifest
    let frameIndex = 0;
    for (const seq of manifestData.sequences) {
      const folderName = seq.folder.replace(/Frames|transition|to|frame| /gi, '').toUpperCase();
      if (folderName === targetPlanet && !seq.folder.toLowerCase().includes('transition')) {
        break;
      }
      frameIndex += seq.frameCount;
    }

    // Calculate scroll percentage based on the frame index
    const totalFrames = manifestData.totalFrames;
    const progress = frameIndex / (totalFrames - 1);
    
    // Calculate the target scroll Y based on the height of the document minus viewport
    // The container is 2000vh tall, so max scroll is roughly 1900vh
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = progress * maxScroll;

    // Use GSAP to auto-scroll
    gsap.to(window, {
      duration: 2.5,
      scrollTo: { y: targetY, autoKill: true },
      ease: 'power3.inOut'
    });
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-20 p-8 flex justify-center pointer-events-none">
      <div className="glass-panel px-8 py-4 flex gap-6 pointer-events-auto">
        {planets.map((planet) => (
          <button
            key={planet}
            onClick={() => handleNavigate(planet)}
            className={`font-mono text-sm tracking-widest transition-colors duration-300 ${
              activePlanet === planet 
                ? 'neon-text-cyan scale-110 font-bold' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            {planet}
          </button>
        ))}
      </div>
    </div>
  );
}
