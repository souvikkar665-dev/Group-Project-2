import { create } from 'zustand';

interface CelestialState {
  currentFrameIndex: number;
  activePlanet: string;
  isTransitioning: boolean;
  telemetryData: {
    temp: string;
    mass: string;
    type: string;
  };
  setCurrentFrame: (index: number) => void;
  setActivePlanet: (planet: string) => void;
  setTransitioning: (status: boolean) => void;
  setTelemetryData: (data: { temp: string; mass: string; type: string }) => void;
}

export const useCelestialStore = create<CelestialState>((set) => ({
  currentFrameIndex: 0,
  activePlanet: 'SUN',
  isTransitioning: false,
  telemetryData: {
    temp: '5,778 K',
    mass: '1.989 × 10^30 kg',
    type: 'Yellow Dwarf',
  },
  setCurrentFrame: (index) => set({ currentFrameIndex: index }),
  setActivePlanet: (planet) => set({ activePlanet: planet }),
  setTransitioning: (status) => set({ isTransitioning: status }),
  setTelemetryData: (data) => set({ telemetryData: data }),
}));
