export const ditherVertex = /* glsl */ `
out vec2 vUv;

void main() {
  // Derive UV from clip-space position so we don't depend on the uv attribute
  // making it through three.js's GLSL3 pipeline.
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const ditherFragment = /* glsl */ `
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uCenter;          // 0..1 in vUv space (y=1 is top)
uniform float uDiskRadius;     // aspect-corrected normalized radius
uniform float uRingSpacing;
uniform int uRingCount;        // 0..10
uniform float uRingFalloff;    // amplitude attenuation per ring
uniform float uRingBreak;      // 0..1, how broken the rings are
uniform float uPixelSize;      // dither tile in CSS px
uniform int uMatrix;           // 0=2x2, 1=4x4, 2=8x8
uniform float uNoiseAmount;    // strength of internal-disk noise modulation
uniform float uNoiseScale;     // noise frequency
uniform float uNoiseSpeed;     // drift speed
uniform float uOpacity;
uniform vec3 uColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const float BAYER2[4] = float[4](0.0, 2.0, 3.0, 1.0);

const float BAYER4[16] = float[16](
   0.0,  8.0,  2.0, 10.0,
  12.0,  4.0, 14.0,  6.0,
   3.0, 11.0,  1.0,  9.0,
  15.0,  7.0, 13.0,  5.0
);

const float BAYER8[64] = float[64](
   0.0, 32.0,  8.0, 40.0,  2.0, 34.0, 10.0, 42.0,
  48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0,
  12.0, 44.0,  4.0, 36.0, 14.0, 46.0,  6.0, 38.0,
  60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0,
   3.0, 35.0, 11.0, 43.0,  1.0, 33.0,  9.0, 41.0,
  51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0,
  15.0, 47.0,  7.0, 39.0, 13.0, 45.0,  5.0, 37.0,
  63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0
);

float bayerThreshold(int x, int y) {
  if (uMatrix == 0) {
    int xi = int(mod(float(x), 2.0));
    int yi = int(mod(float(y), 2.0));
    return (BAYER2[yi * 2 + xi] + 0.5) / 4.0;
  } else if (uMatrix == 1) {
    int xi = int(mod(float(x), 4.0));
    int yi = int(mod(float(y), 4.0));
    return (BAYER4[yi * 4 + xi] + 0.5) / 16.0;
  }
  int xi = int(mod(float(x), 8.0));
  int yi = int(mod(float(y), 8.0));
  return (BAYER8[yi * 8 + xi] + 0.5) / 64.0;
}

void main() {
  // Snap to dither tile
  vec2 pixel = vUv * uResolution;
  float tile = max(uPixelSize, 1.0);
  vec2 cell = floor(pixel / tile);
  vec2 cellUv = (cell + 0.5) * tile / uResolution;

  // Aspect-corrected radial coords so circles stay circular
  float aspect = uResolution.x / uResolution.y;
  vec2 dv = cellUv - uCenter;
  dv.x *= aspect;
  float r = length(dv);
  float angle = atan(dv.y, dv.x);

  // Slow noise drift over space + time
  float t = uTime * uNoiseSpeed;
  float n = vnoise(cellUv * uNoiseScale + vec2(t, t * 0.7));

  // Central disk: bright inside uDiskRadius with smooth edge, modulated by noise
  float disk = 1.0 - smoothstep(uDiskRadius * 0.6, uDiskRadius, r);
  float diskBody = disk * (1.0 + (n - 0.5) * 2.0 * uNoiseAmount);

  // Concentric rings outside the disk, broken by angular noise
  float rings = 0.0;
  for (int i = 1; i <= 10; i++) {
    if (i > uRingCount) break;
    float ringR = uDiskRadius + float(i) * uRingSpacing;
    float halfWidth = max(uRingSpacing * 0.3, 0.005);
    float d = (r - ringR) / halfWidth;
    float pulse = exp(-d * d);

    float angBreak = vnoise(vec2(angle * 4.0 + float(i) * 13.0, t * 0.5));
    pulse *= mix(1.0, angBreak, uRingBreak);
    pulse *= pow(uRingFalloff, float(i - 1));

    rings = max(rings, pulse);
  }

  float source = clamp(max(diskBody, rings), 0.0, 1.0);

  // Halftone: dot radius is proportional to source intensity per cell.
  // Bayer threshold jitters the radius slightly so the pattern keeps an organic feel.
  float th = bayerThreshold(int(cell.x), int(cell.y));
  float jitter = (th - 0.5) * 0.15;
  float intensity = clamp(source + jitter, 0.0, 1.0);

  vec2 within = pixel - cell * tile;
  float distFromCellCenter = length(within - vec2(tile * 0.5));
  float maxRadius = tile * 0.5;
  float dotRadius = intensity * maxRadius;
  float circle = step(0.005, intensity)
    * (1.0 - smoothstep(dotRadius - 0.5, dotRadius + 0.5, distFromCellCenter));

  fragColor = vec4(uColor, circle * uOpacity);
}
`;
