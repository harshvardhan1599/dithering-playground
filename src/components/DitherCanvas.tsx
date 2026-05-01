import { Canvas, useFrame } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";
import { useControls } from "leva";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ditherFragment, ditherVertex } from "../shaders/dither";

const PATTERNS = { "Bayer 2×2": 0, "Bayer 4×4": 1, "Bayer 8×8": 2 } as const;
const HOVER_MODES = { Punch: 0, Erase: 1 } as const;

type Controls = {
  pattern: number;
  levels: number;
  pixelSize: number;
  hoverIntensity: number;
  hoverMode: number;
  colorA: string;
  colorB: string;
  monochrome: boolean;
};

function DitherMesh({ controls }: { controls: Controls }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMatrix: { value: 2 },
      uLevels: { value: 2 },
      uPixelSize: { value: 3 },
      uHoverIntensity: { value: 0.6 },
      uHoverMode: { value: 0 },
      uColorA: { value: new THREE.Color("#0a0a0a") },
      uColorB: { value: new THREE.Color("#fafafa") },
      uMonochrome: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (!matRef.current) return;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uMouse.value.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5,
    );
    uniforms.uResolution.value.set(state.size.width, state.size.height);

    uniforms.uMatrix.value = controls.pattern;
    uniforms.uLevels.value = Math.round(controls.levels);
    uniforms.uPixelSize.value = controls.pixelSize;
    uniforms.uHoverIntensity.value = controls.hoverIntensity;
    uniforms.uHoverMode.value = controls.hoverMode;
    uniforms.uColorA.value.set(controls.colorA);
    uniforms.uColorB.value.set(controls.colorB);
    uniforms.uMonochrome.value = controls.monochrome ? 1 : 0;
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={ditherVertex}
        fragmentShader={ditherFragment}
        glslVersion={THREE.GLSL3}
      />
    </ScreenQuad>
  );
}

export function DitherCanvas() {
  const controls = useControls("Dither", {
    pattern: { value: 2, options: PATTERNS },
    levels: { value: 2, min: 2, max: 8, step: 1 },
    pixelSize: { value: 3, min: 1, max: 12, step: 1 },
    hoverIntensity: { value: 0.6, min: 0, max: 1.5, step: 0.01 },
    hoverMode: { value: 0, options: HOVER_MODES },
    colorA: "#0a0a0a",
    colorB: "#fafafa",
    monochrome: false,
  }) as Controls;

  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: false }}>
      <DitherMesh controls={controls} />
    </Canvas>
  );
}
