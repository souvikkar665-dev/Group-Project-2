from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import asyncio
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PLANET_DATA = {
    "SUN": {"temp_base": 5778, "type": "Yellow Dwarf", "mass": "1.989 × 10^30 kg"},
    "MERCURY": {"temp_base": 430, "type": "Terrestrial", "mass": "3.301 × 10^23 kg"},
    "VENUS": {"temp_base": 471, "type": "Terrestrial", "mass": "4.867 × 10^24 kg"},
    "EARTH": {"temp_base": 15, "type": "Terrestrial", "mass": "5.972 × 10^24 kg"},
    "MARS": {"temp_base": -65, "type": "Terrestrial", "mass": "6.39 × 10^23 kg"},
    "JUPITER": {"temp_base": -110, "type": "Gas Giant", "mass": "1.898 × 10^27 kg"},
    "SATURN": {"temp_base": -140, "type": "Gas Giant", "mass": "5.683 × 10^26 kg"},
    "URANUS": {"temp_base": -195, "type": "Ice Giant", "mass": "8.681 × 10^25 kg"},
    "NEPTUNE": {"temp_base": -200, "type": "Ice Giant", "mass": "1.024 × 10^26 kg"},
}

@app.get("/")
def read_root():
    return {"status": "Celestial Engine API Online"}

@app.get("/telemetry/{planet}")
def get_telemetry(planet: str):
    planet = planet.upper()
    if planet not in PLANET_DATA:
        return {"temp": "3 K", "type": "Deep Space", "mass": "0 kg"}
    
    data = PLANET_DATA[planet]
    # Simulate live micro-fluctuations in temperature
    fluctuation = random.uniform(-2.5, 2.5)
    live_temp = data["temp_base"] + fluctuation
    
    unit = "K" if planet == "SUN" else "°C"
    
    return {
        "temp": f"{live_temp:.1f} {unit}",
        "type": data["type"],
        "mass": data["mass"]
    }
