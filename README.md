# Dithering Playground

A live sandbox for fancy dither effects driven by hover. Tune Bayer matrix size,
quantization levels, tile size, hover spotlight, and palette — everything updates
in real time over a fragment shader.

## Stack

Vite + React + TypeScript + Tailwind v4 + @react-three/fiber + drei + leva.

## Run locally

```bash
npm install
npm run dev
```

Open the dev URL Vite prints. Move the cursor to drive the hover effect, and
use the leva panel in the top-right to tune the dither.
