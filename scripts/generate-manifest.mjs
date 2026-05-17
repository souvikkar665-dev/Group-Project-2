import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const framesDir = path.join(__dirname, '../public/frames');
const dirs = fs.readdirSync(framesDir).filter(f => fs.statSync(path.join(framesDir, f)).isDirectory());

// We want a specific order: Sun -> Sun to mercury -> Mercury ...
const order = [
  "Sun Frames",
  "Sun to mercury transition frame",
  "Mercury Frames",
  "Mercury to venus transition frame",
  "Venus Frames",
  "Venus to earth transition frame",
  "Earth Frames",
  "Earth to mars transition",
  "Mars Frames",
  "Mars to Jupiter transition frame",
  "Jupiter Frames",
  "Jupiter to Saturn transition frames",
  "Saturn Frames",
  "Saturn to Uranus transition frame",
  "Uranus Frames",
  "Uranus to Neptune transition frame",
  "Neptune Frames"
];

// Sort directories based on the predefined order
dirs.sort((a, b) => {
  const indexA = order.indexOf(a);
  const indexB = order.indexOf(b);
  return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
});

const manifest = [];
let totalFrames = 0;

for (const dir of dirs) {
  const dirPath = path.join(framesDir, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));
  
  // Sort files numerically if possible
  files.sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    return numA - numB;
  });

  manifest.push({
    folder: dir,
    frameCount: files.length,
    files: files
  });
  
  totalFrames += files.length;
}

const outputPath = path.join(__dirname, '../src/lib/manifest.json');
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}
fs.writeFileSync(outputPath, JSON.stringify({ totalFrames, sequences: manifest }, null, 2));

console.log(`Manifest generated successfully at src/lib/manifest.json with ${totalFrames} total frames.`);
