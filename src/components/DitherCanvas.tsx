import { ScreenQuad } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ditherFragment, ditherVertex } from "../shaders/dither";

export type DitherControls = {
  centerX: number;
  centerY: number;
  diskRadius: number;
  ringSpacing: number;
  ringCount: number;
  ringFalloff: number;
  ringBreak: number;
  pixelSize: number;
  matrix: number;
  noiseAmount: number;
  noiseScale: number;
  noiseSpeed: number;
  opacity: number;
  color: string;
};

export function DitherMesh({ controls }: { controls: DitherControls }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uDiskRadius: { value: 0.18 },
      uRingSpacing: { value: 0.12 },
      uRingCount: { value: 4 },
      uRingFalloff: { value: 0.6 },
      uRingBreak: { value: 0.7 },
      uPixelSize: { value: 3 },
      uMatrix: { value: 2 },
      uNoiseAmount: { value: 0.6 },
      uNoiseScale: { value: 6 },
      uNoiseSpeed: { value: 0.05 },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color("#ffffff") },
    }),
    [],
  );

  useFrame((state) => {
    const m = matRef.current;
    if (!m) return;
    // Read uniforms from the live material to dodge stale closures across HMR
    const u = m.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uResolution.value.set(state.size.width, state.size.height);
    u.uCenter.value.set(controls.centerX / 100, 1 - controls.centerY / 100);
    u.uDiskRadius.value = controls.diskRadius;
    u.uRingSpacing.value = controls.ringSpacing;
    u.uRingCount.value = Math.round(controls.ringCount);
    u.uRingFalloff.value = controls.ringFalloff;
    u.uRingBreak.value = controls.ringBreak;
    u.uPixelSize.value = controls.pixelSize;
    u.uMatrix.value = controls.matrix;
    u.uNoiseAmount.value = controls.noiseAmount;
    u.uNoiseScale.value = controls.noiseScale;
    u.uNoiseSpeed.value = controls.noiseSpeed;
    u.uOpacity.value = controls.opacity;
    u.uColor.value.set(controls.color);
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={ditherVertex}
        fragmentShader={ditherFragment}
        glslVersion={THREE.GLSL3}
        transparent
      />
    </ScreenQuad>
  );
}
