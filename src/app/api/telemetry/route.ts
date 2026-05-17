import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const planet = searchParams.get('planet') || 'SUN';

  // In production, this would fetch from the Python FastAPI microservice
  try {
    const res = await fetch(`http://localhost:8000/telemetry/${planet}`);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    
    // Fallback Mock Data while FastAPI is spinning up
    const mockData: Record<string, any> = {
      SUN: { temp: '5,778 K', type: 'Yellow Dwarf', mass: '1.989 × 10^30 kg' },
      MERCURY: { temp: '430 °C', type: 'Terrestrial', mass: '3.301 × 10^23 kg' },
      VENUS: { temp: '471 °C', type: 'Terrestrial', mass: '4.867 × 10^24 kg' },
      EARTH: { temp: '15 °C', type: 'Terrestrial', mass: '5.972 × 10^24 kg' },
      MARS: { temp: '-65 °C', type: 'Terrestrial', mass: '6.39 × 10^23 kg' },
      JUPITER: { temp: '-110 °C', type: 'Gas Giant', mass: '1.898 × 10^27 kg' },
      SATURN: { temp: '-140 °C', type: 'Gas Giant', mass: '5.683 × 10^26 kg' },
      URANUS: { temp: '-195 °C', type: 'Ice Giant', mass: '8.681 × 10^25 kg' },
      NEPTUNE: { temp: '-200 °C', type: 'Ice Giant', mass: '1.024 × 10^26 kg' },
    };

    const data = mockData[planet.toUpperCase()] || { temp: '3 K', type: 'Deep Space', mass: '0 kg' };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch telemetry' }, { status: 500 });
  }
}
