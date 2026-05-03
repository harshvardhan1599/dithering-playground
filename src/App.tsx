import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { DitherMesh, type DitherControls } from "./components/DitherCanvas";

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
    diskRadius: { value: 0.18, min: 0.0, max: 0.6, step: 0.005 },
    ringSpacing: { value: 0.12, min: 0.01, max: 0.4, step: 0.005 },
    ringCount: { value: 4, min: 0, max: 10, step: 1 },
    ringFalloff: { value: 0.6, min: 0.1, max: 1, step: 0.01 },
    ringBreak: { value: 0.7, min: 0, max: 1, step: 0.01 },
    pixelSize: { value: 3, min: 1, max: 12, step: 1 },
    matrix: { value: 2, options: MATRICES },
    noiseAmount: { value: 0.6, min: 0, max: 1, step: 0.01 },
    noiseScale: { value: 6, min: 0.5, max: 30, step: 0.5 },
    noiseSpeed: { value: 0.05, min: 0, max: 1, step: 0.01 },
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
    color: "#ffffff",
  }) as DitherControls;

  const cell = 96;
  const arm = 5;
  const lineColor = "rgba(255,255,255,0.12)";
  const plusColor = "rgba(255,255,255,0.7)";

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${cell}' height='${cell}' viewBox='0 0 ${cell} ${cell}'>` +
    `<path d='M0 0 H${cell} M0 0 V${cell}' stroke='${lineColor}' stroke-width='1' shape-rendering='crispEdges'/>` +
    `<path d='M0 0 H${arm} M0 0 V${arm} ` +
    `M${cell} 0 H${cell - arm} M${cell} 0 V${arm} ` +
    `M0 ${cell} H${arm} M0 ${cell} V${cell - arm} ` +
    `M${cell} ${cell} H${cell - arm} M${cell} ${cell} V${cell - arm}' ` +
    `stroke='${plusColor}' stroke-width='1' shape-rendering='crispEdges'/>` +
    `</svg>`;
  const gridUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

  const mask = `radial-gradient(circle at ${centerX}% ${centerY}%, transparent 0%, black ${innerStop}%, black ${outerStop}%, transparent 100%)`;

  return (
    <div
      className="fixed inset-0"
      style={{
        background:
          "linear-gradient(to bottom, #00021B 0%, #002A9A 40%, #0081F3 69%, #F1F8FE 100%)",
      }}
    >
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
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true }}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <DitherMesh controls={ditherControls} />
      </Canvas>
    </div>
  );
}

export default App;
