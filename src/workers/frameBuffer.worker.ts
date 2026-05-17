// src/workers/frameBuffer.worker.ts
/// <reference lib="webworker" />

self.addEventListener('message', async (event: MessageEvent) => {
  const { type, frames, baseUrl } = event.data;

  if (type === 'PRELOAD_FRAMES') {
    // Preload frames to the browser cache
    for (const framePath of frames) {
      try {
        const url = `${baseUrl}${framePath}`;
        // We use fetch to prime the browser cache
        await fetch(url, { mode: 'no-cors', cache: 'force-cache' });
      } catch (error) {
        console.error('Failed to preload frame:', framePath, error);
      }
    }
    
    self.postMessage({ type: 'PRELOAD_COMPLETE', framesPreloaded: frames.length });
  }
});

export {};
