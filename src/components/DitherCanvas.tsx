import { ScreenQuad } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ditherFragment, ditherVertex } from "../shaders/dither";
import type { Shape } from "../shapes";

const PLACEHOLDER_TEX = (() => {
  const tex = new THREE.DataTexture(
    new Uint8Array([0, 0, 0, 0]),
    1,
    1,
    THREE.RGBAFormat,
  );
  tex.needsUpdate = true;
  return tex;
})();

function rasterizeSvgToTexture(svg: string, size = 512): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("2D context unavailable"));
        return;
      }
      const aspect = (img.width || size) / (img.height || size);
      let w = size;
      let h = size;
      if (aspect > 1) h = size / aspect;
      else w = size * aspect;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

      const imgData = ctx.getImageData(0, 0, size, size);
      // Copy the canvas bytes into a fresh Uint8Array — three.js's DataTexture
      // path is more reliable than CanvasTexture upload for this use case.
      const bytes = new Uint8Array(imgData.data.length);
      bytes.set(imgData.data);
      const tex = new THREE.DataTexture(
        bytes,
        size,
        size,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
      );
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.onerror = (e) => reject(e);
    // Data URL is more portable than a Blob URL for SVG <-> Image rasterization.
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

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
  shape,
}: {
  controls: DitherControls;
  visibility: DitherLayerVisibility;
  shape: Shape;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const textureReadyRef = useRef(false);
  const textureRef = useRef<THREE.Texture | null>(null);

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
      uShapeMode: { value: 0 },
      uShapeScale: { value: 0.3 },
      uRippleAmount: { value: 0 },
      uShapeTex: { value: PLACEHOLDER_TEX as THREE.Texture },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color("#ffffff") },
    }),
    [],
  );

  useEffect(() => {
    textureReadyRef.current = false;
    if (shape.kind === "analytic") return;
    let cancelled = false;
    rasterizeSvgToTexture(shape.svg)
      .then((tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        const old = textureRef.current;
        textureRef.current = tex;
        textureReadyRef.current = true;
        if (old) old.dispose();
      })
      .catch((err) =>
        console.error("[DitherMesh] SVG rasterize failed", err),
      );
    return () => {
      cancelled = true;
    };
  }, [shape]);

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
    const useTex =
      shape.kind === "svg" && textureReadyRef.current && textureRef.current;
    u.uShapeMode.value = useTex ? 1 : 0;
    u.uShapeTex.value = useTex ? textureRef.current : PLACEHOLDER_TEX;
    u.uRippleAmount.value =
      useTex && shape.kind === "svg" ? (shape.ripple ?? 0) : 0;
    u.uShapeScale.value =
      shape.kind === "svg" ? (shape.scale ?? 0.3) : 0.3;
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
