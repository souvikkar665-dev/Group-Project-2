import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import manifestData from '../lib/manifest.json';

interface FrameCanvasProps {
  currentFrameIndex: number; // 0 to 4070
}

// Flat array of all frame URLs
const allFrames: string[] = [];
manifestData.sequences.forEach((seq) => {
  seq.files.forEach((file) => {
    allFrames.push(`/frames/${seq.folder}/${file}`);
  });
});

const ImagePlane = ({ frameIndex }: { frameIndex: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  
  // LRU Cache for textures to prevent memory leaks while keeping recent frames
  const textureCache = useRef<Map<string, THREE.Texture>>(new Map());

  useEffect(() => {
    const url = allFrames[frameIndex];
    if (!url) return;

    let texture = textureCache.current.get(url);

    if (!texture) {
      texture = textureLoader.load(url, (loadedTexture) => {
        loadedTexture.generateMipmaps = false;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        
        if (materialRef.current) {
          materialRef.current.map = loadedTexture;
          materialRef.current.needsUpdate = true;
        }
      });
      textureCache.current.set(url, texture);
    } else {
      if (materialRef.current) {
        materialRef.current.map = texture;
        materialRef.current.needsUpdate = true;
      }
    }

    // Cleanup old textures (keep max 100 in memory)
    if (textureCache.current.size > 100) {
      const keys = Array.from(textureCache.current.keys());
      const toDelete = keys.slice(0, 20); // remove oldest 20
      toDelete.forEach((key) => {
        const t = textureCache.current.get(key);
        t?.dispose();
        textureCache.current.delete(key);
      });
    }
  }, [frameIndex, textureLoader]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[16, 9]} /> {/* Assuming 16:9 aspect ratio */}
      <meshBasicMaterial ref={materialRef} side={THREE.DoubleSide} transparent={true} />
    </mesh>
  );
};

export default function FrameCanvas({ currentFrameIndex }: FrameCanvasProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ powerPreference: 'high-performance', antialias: false }}
      >
        <ImagePlane frameIndex={currentFrameIndex} />
      </Canvas>
    </div>
  );
}
