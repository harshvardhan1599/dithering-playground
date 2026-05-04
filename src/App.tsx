import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { DitherMesh, type DitherControls } from "./components/DitherCanvas";
import {
  LayersPanel,
  type LayerKey,
  type LayerVisibility,
} from "./components/LayersPanel";
import { BACKGROUNDS, PropertiesPanel } from "./components/PropertiesPanel";

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
  noiseScale: 10.5,
  noiseSpeed: 0.66,
  sparsity: 0.13,
  dotJitter: 0.31,
  hoverIntensity: 0.71,
  hoverRadius: 0.19,
  hoverPulseSpeed: 2.0,
  hoverPulseAmount: 0.46,
  opacity: 1,
  color: "#ffffff",
};

function App() {
  const [ditherControls, setDitherControls] =
    useState<DitherControls>(INITIAL_DITHER);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

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

  const mask =
    "radial-gradient(circle at 50% 50%, black 0%, transparent 100%)";

  const [visibility, setVisibility] = useState<LayerVisibility>({
    gradient: true,
    grid: true,
    shape: true,
    noise: true,
    dots: true,
  });

  const toggleLayer = (key: LayerKey) =>
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="fixed inset-0" style={{ background: "#000" }}>
      {visibility.gradient && (
        <div
          className="absolute inset-0"
          style={{ background: BACKGROUNDS[backgroundIndex].page }}
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
        />
      </Canvas>
      <LayersPanel visibility={visibility} onToggle={toggleLayer} />
      <PropertiesPanel
        controls={ditherControls}
        onChange={updateDither}
        backgroundIndex={backgroundIndex}
        onBackgroundChange={setBackgroundIndex}
      />
    </div>
  );
}

export default App;
