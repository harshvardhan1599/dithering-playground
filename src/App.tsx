import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { DitherMesh, type DitherControls } from "./components/DitherCanvas";
import {
  LayersPanel,
  type LayerKey,
  type LayerVisibility,
} from "./components/LayersPanel";

const MATRICES = { "Bayer 2×2": 0, "Bayer 4×4": 1, "Bayer 8×8": 2 } as const;

function App() {
  const { centerX, centerY, innerStop, outerStop, opacity } = useControls(
    "Mask",
    {
      centerX: { value: 50, min: 0, max: 100, step: 1, label: "center X %" },
      centerY: { value: 50, min: 0, max: 100, step: 1, label: "center Y %" },
      innerStop: {
        value: 25,
        min: 0,
        max: 100,
        step: 1,
        label: "inner stop %",
      },
      outerStop: {
        value: 65,
        min: 0,
        max: 100,
        step: 1,
        label: "outer stop %",
      },
      opacity: { value: 1, min: 0, max: 1, step: 0.01, label: "opacity" },
    },
  );

  const ditherControls = useControls("Dither", {
    centerX: { value: 50, min: 0, max: 100, step: 1, label: "center X %" },
    centerY: { value: 50, min: 0, max: 100, step: 1, label: "center Y %" },
    diskRadius: { value: 0.19, min: 0.0, max: 0.6, step: 0.005 },
    ringSpacing: { value: 0.1, min: 0.01, max: 0.4, step: 0.005 },
    ringWidth: { value: 0.24, min: 0.05, max: 1, step: 0.01 },
    ringCount: { value: 4, min: 0, max: 10, step: 1 },
    ringFalloff: { value: 0.6, min: 0.1, max: 1, step: 0.01 },
    ringBreak: { value: 0.7, min: 0, max: 1, step: 0.01 },
    pixelSize: { value: 8, min: 1, max: 12, step: 1 },
    matrix: { value: 2, options: MATRICES },
    noiseAmount: { value: 0.6, min: 0, max: 1, step: 0.01 },
    noiseScale: { value: 10.5, min: 0.5, max: 30, step: 0.5 },
    noiseSpeed: { value: 0.66, min: 0, max: 1, step: 0.01 },
    sparsity: { value: 0.13, min: 0, max: 1, step: 0.01 },
    dotJitter: { value: 0.31, min: 0, max: 1, step: 0.01 },
    hoverIntensity: { value: 0.71, min: 0, max: 1.5, step: 0.01 },
    hoverRadius: { value: 0.19, min: 0.01, max: 1, step: 0.01 },
    hoverPulseSpeed: { value: 2.0, min: 0, max: 10, step: 0.1 },
    hoverPulseAmount: { value: 0.46, min: 0, max: 1, step: 0.01 },
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
    color: "#ffffff",
  }) as DitherControls;

  const cell = 96;
  const lineColor = "rgba(255,255,255,0.12)";

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${cell}' height='${cell}' viewBox='0 0 ${cell} ${cell}'>` +
    `<path d='M0 0 H${cell} M0 0 V${cell}' stroke='${lineColor}' stroke-width='1' shape-rendering='crispEdges'/>` +
    `</svg>`;
  const gridUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

  const mask = `radial-gradient(circle at ${centerX}% ${centerY}%, transparent 0%, black ${innerStop}%, black ${outerStop}%, transparent 100%)`;

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
          style={{
            background:
              "linear-gradient(to bottom, #00021B 0%, #002A9A 40%, #0081F3 69%, #F1F8FE 100%)",
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
            opacity,
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
    </div>
  );
}

export default App;
