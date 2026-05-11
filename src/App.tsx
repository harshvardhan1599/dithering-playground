import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { DitherMesh, type DitherControls } from "./components/DitherCanvas";
import {
  LayersPanel,
  type LayerKey,
  type LayerVisibility,
} from "./components/LayersPanel";
import { BACKGROUNDS, PropertiesPanel } from "./components/PropertiesPanel";
import { SHAPES } from "./shapes";
import { SoundsProvider, useSounds } from "./sounds";

function hexLum(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function pickContrastColor(
  pageGradient: string,
  anchor: "top" | "bottom",
): string {
  const stops = pageGradient.match(/#[0-9A-Fa-f]{6}/g) ?? [];
  const [firstStop] = stops;
  if (firstStop === undefined) return "#ffffff";
  const lastStop = stops[stops.length - 1] ?? firstStop;
  const anchorColor = anchor === "top" ? firstStop : lastStop;
  const anchorLum = hexLum(anchorColor);
  let best = firstStop;
  let bestDist = Math.abs(hexLum(best) - anchorLum);
  for (const c of stops) {
    const d = Math.abs(hexLum(c) - anchorLum);
    if (d > bestDist) {
      best = c;
      bestDist = d;
    }
  }
  return best;
}

const INITIAL_DITHER: DitherControls = {
  centerX: 50,
  centerY: 50,
  diskRadius: 0.19,
  ringSpacing: 0.1,
  ringWidth: 0.24,
  ringCount: 4,
  ringFalloff: 0.6,
  ringBreak: 0.7,
  pixelSize: 8,
  matrix: 2,
  noiseAmount: 0.6,
  noiseScale: 16,
  noiseSpeed: 1,
  sparsity: 0.13,
  dotJitter: 0.31,
  hoverIntensity: 0.71,
  hoverRadius: 0.19,
  hoverPulseSpeed: 2.0,
  hoverPulseAmount: 0.46,
  opacity: 1,
  color: "#ffffff",
};

function SoundOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 8v4h3l4 3V5L6 8H3Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 7c1.2 1 1.2 5 0 6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M15.5 5c2.2 1.7 2.2 8.3 0 10"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 8v4h3l4 3V5L6 8H3Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="13"
        y1="7"
        x2="18"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="7"
        x2="13"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function App() {
  return (
    <SoundsProvider>
      <AppInner />
    </SoundsProvider>
  );
}

function AppInner() {
  const { play, muted, setMuted } = useSounds();
  const [ditherControls, setDitherControls] =
    useState<DitherControls>(INITIAL_DITHER);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [shapeIndex, setShapeIndex] = useState(0);

  const updateDither = <K extends keyof DitherControls>(
    key: K,
    value: DitherControls[K],
  ) => setDitherControls((prev) => ({ ...prev, [key]: value }));

  const cell = 96;
  const lineColor = "rgba(255,255,255,0.12)";

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${cell}' height='${cell}' viewBox='0 0 ${cell} ${cell}'>` +
    `<path d='M0 0 H${cell} M0 0 V${cell}' stroke='${lineColor}' stroke-width='1' shape-rendering='crispEdges'/>` +
    `</svg>`;
  const gridUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

  const grainSvg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>` +
    `<filter id='g'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='0.70' numOctaves='2' stitchTiles='stitch' seed='5'/>` +
    `<feColorMatrix type='saturate' values='0'/>` +
    `</filter>` +
    `<rect width='100%' height='100%' filter='url(#g)'/>` +
    `</svg>`;
  const grainUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(grainSvg)}")`;

  const mask =
    "radial-gradient(circle at 50% 50%, black 0%, transparent 100%)";

  const [visibility, setVisibility] = useState<LayerVisibility>({
    gradient: true,
    grain: true,
    grid: true,
    shape: true,
    noise: true,
    dots: true,
  });

  const toggleLayer = (key: LayerKey) =>
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));

  const darkUI = BACKGROUNDS[backgroundIndex].darkUI ?? false;
  const titleColor = pickContrastColor(
    BACKGROUNDS[backgroundIndex].page,
    "top",
  );
  const footerColor = pickContrastColor(
    BACKGROUNDS[backgroundIndex].page,
    "bottom",
  );

  return (
    <div className="fixed inset-0" style={{ background: "#000" }}>
      {visibility.gradient && (
        <div
          className="absolute inset-0"
          style={{ background: BACKGROUNDS[backgroundIndex].page }}
        />
      )}
      {visibility.grain && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: grainUrl,
            backgroundSize: "200px 200px",
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
            opacity: 0.5,
          }}
        />
      )}
      {visibility.grid && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: gridUrl,
            backgroundSize: `${cell}px ${cell}px`,
            backgroundRepeat: "repeat",
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      )}
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true }}
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <DitherMesh
          controls={ditherControls}
          visibility={{
            shape: visibility.shape,
            noise: visibility.noise,
            dots: visibility.dots,
          }}
          shape={SHAPES[shapeIndex]}
        />
      </Canvas>
      <div
        className="pointer-events-none fixed left-1/2 top-4 z-10 -translate-x-1/2 text-[12px] font-medium tracking-[0.18em]"
        style={{
          fontFamily: "'Departure Mono', ui-monospace, monospace",
          color: titleColor,
        }}
      >
        {SHAPES[shapeIndex].label.toUpperCase()}
        <span className="mx-2" style={{ opacity: 0.4 }}>
          /
        </span>
        {BACKGROUNDS[backgroundIndex].name.toUpperCase()}
      </div>
      <div
        className="fixed bottom-4 left-4 z-10 text-[12px] tracking-[0.18em]"
        style={{
          fontFamily: "'Departure Mono', ui-monospace, monospace",
          color: footerColor,
        }}
      >
        <span style={{ opacity: 0.7 }}>MADE BY</span>{" "}
        <a
          href="https://harshvardhan.work"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:underline"
          onClick={() => play("click")}
        >
          HARSH
        </a>
      </div>
      <button
        type="button"
        onClick={() => {
          play("click");
          setMuted(!muted);
        }}
        aria-label={muted ? "Unmute sounds" : "Mute sounds"}
        aria-pressed={muted}
        className="fixed bottom-4 right-4 z-10 grid h-8 w-8 place-items-center rounded transition-opacity hover:opacity-100"
        style={{ color: footerColor, opacity: 0.7 }}
      >
        {muted ? <SoundOffIcon /> : <SoundOnIcon />}
      </button>
      <LayersPanel
        visibility={visibility}
        onToggle={toggleLayer}
        darkUI={darkUI}
      />
      <PropertiesPanel
        controls={ditherControls}
        onChange={updateDither}
        backgroundIndex={backgroundIndex}
        onBackgroundChange={setBackgroundIndex}
        shapeIndex={shapeIndex}
        onShapeChange={setShapeIndex}
        darkUI={darkUI}
      />
    </div>
  );
}

export default App;
