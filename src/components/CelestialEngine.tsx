'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin';
import FrameCanvas from './FrameCanvas';
import manifestData from '../lib/manifest.json';
import TelemetryOverlay from './TelemetryOverlay';
import NavigationHUD from './NavigationHUD';
import { useCelestialStore } from '../store/useCelestialStore';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

// Flatten frame URLs outside component to maintain stable reference
const allFrameUrls = manifestData.sequences.flatMap(seq => 
  seq.files.map(file => `/frames/${seq.folder}/${file}`)
);

export default function CelestialEngine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  
  const { setCurrentFrame, setActivePlanet, setTransitioning, currentFrameIndex } = useCelestialStore();

  const totalFrames = manifestData.totalFrames;

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker(new URL('../workers/frameBuffer.worker.ts', import.meta.url));
    
    // Initial preload of first 100 frames
    const initialBatch = allFrameUrls.slice(0, 100);
    workerRef.current.postMessage({
      type: 'PRELOAD_FRAMES',
      frames: initialBatch,
      baseUrl: window.location.origin
    });

    return () => {
      workerRef.current?.terminate();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!containerRef.current) return;
    
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1, // linear interpolation smoothing
      onUpdate: (self) => {
        const rawFrame = Math.floor(self.progress * (totalFrames - 1));
        setCurrentFrame(rawFrame);

        // Calculate planet info for the Zustand store based on current frame
        let acc = 0;
        let currentFolder = '';
        for (const seq of manifestData.sequences) {
          acc += seq.frameCount;
          if (rawFrame < acc) {
            currentFolder = seq.folder;
            break;
          }
        }

        const isTrans = currentFolder.toLowerCase().includes('transition');
        const pName = currentFolder.replace(/Frames|transition|to|frame| /gi, '').toUpperCase() || 'SPACE';
        
        setActivePlanet(pName);
        setTransitioning(isTrans);

        // Tell worker to preload next 50 frames ahead of current position
        if (workerRef.current && rawFrame % 20 === 0) { // Throttle messages
          const nextBatch = allFrameUrls.slice(rawFrame, rawFrame + 50);
          workerRef.current.postMessage({
            type: 'PRELOAD_FRAMES',
            frames: nextBatch,
            baseUrl: window.location.origin
          });
        }
      }
    });

    return () => {
      st.kill();
    };
  }, [totalFrames, allFrameUrls, setActivePlanet, setCurrentFrame, setTransitioning]);

  return (
    <div ref={containerRef} style={{ height: '2000vh', position: 'relative' }}>
      <FrameCanvas currentFrameIndex={currentFrameIndex} />
      <TelemetryOverlay />
      <NavigationHUD />
    </div>
  );
}
