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
  ringWidth: number;
  ringCount: number;
  ringFalloff: number;
  ringBreak: number;
  pixelSize: number;
  matrix: number;
  noiseAmount: number;
  noiseScale: number;
  noiseSpeed: number;
  sparsity: number;
  dotJitter: number;
  hoverIntensity: number;
  hoverRadius: number;
  hoverPulseSpeed: number;
  hoverPulseAmount: number;
  opacity: number;
  color: string;
};

export type DitherLayerVisibility = {
  shape: boolean;
  noise: boolean;
  dots: boolean;
};

export function DitherMesh({
  controls,
  visibility,
}: {
  controls: DitherControls;
  visibility: DitherLayerVisibility;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uDiskRadius: { value: 0.18 },
      uRingSpacing: { value: 0.12 },
      uRingWidth: { value: 0.3 },
      uRingCount: { value: 4 },
      uRingFalloff: { value: 0.6 },
      uRingBreak: { value: 0.7 },
      uPixelSize: { value: 3 },
      uMatrix: { value: 2 },
      uNoiseAmount: { value: 0.6 },
      uNoiseScale: { value: 6 },
      uNoiseSpeed: { value: 0.05 },
      uSparsity: { value: 0 },
      uDotJitter: { value: 0.15 },
      uMouse: { value: new THREE.Vector2(-10, -10) },
      uHoverIntensity: { value: 0.6 },
      uHoverRadius: { value: 0.25 },
      uHoverPulseSpeed: { value: 2.0 },
      uHoverPulseAmount: { value: 0.3 },
      uShapeEnabled: { value: 1 },
      uNoiseEnabled: { value: 1 },
      uDotsEnabled: { value: 1 },
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
    u.uRingWidth.value = controls.ringWidth;
    u.uRingCount.value = Math.round(controls.ringCount);
    u.uRingFalloff.value = controls.ringFalloff;
    u.uRingBreak.value = controls.ringBreak;
    u.uPixelSize.value = controls.pixelSize;
    u.uMatrix.value = controls.matrix;
    u.uNoiseAmount.value = controls.noiseAmount;
    u.uNoiseScale.value = controls.noiseScale;
    u.uNoiseSpeed.value = controls.noiseSpeed;
    u.uSparsity.value = controls.sparsity;
    u.uDotJitter.value = controls.dotJitter;
    u.uMouse.value.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5,
    );
    u.uHoverIntensity.value = controls.hoverIntensity;
    u.uHoverRadius.value = controls.hoverRadius;
    u.uHoverPulseSpeed.value = controls.hoverPulseSpeed;
    u.uHoverPulseAmount.value = controls.hoverPulseAmount;
    u.uShapeEnabled.value = visibility.shape ? 1 : 0;
    u.uNoiseEnabled.value = visibility.noise ? 1 : 0;
    u.uDotsEnabled.value = visibility.dots ? 1 : 0;
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
