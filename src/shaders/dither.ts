export const ditherVertex = /* glsl */ `
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const ditherFragment = /* glsl */ `
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform int uMatrix;          // 0 = 2x2, 1 = 4x4, 2 = 8x8
uniform int uLevels;          // 2..8 quantization levels
uniform float uPixelSize;     // tile size (>=1)
uniform float uHoverIntensity;
uniform int uHoverMode;       // 0 = punch, 1 = erase
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform int uMonochrome;

const float BAYER2[4] = float[4](
  0.0, 2.0,
  3.0, 1.0
);

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
    return BAYER2[yi * 2 + xi] / 4.0;
  } else if (uMatrix == 1) {
    int xi = int(mod(float(x), 4.0));
    int yi = int(mod(float(y), 4.0));
    return BAYER4[yi * 4 + xi] / 16.0;
  }
  int xi = int(mod(float(x), 8.0));
  int yi = int(mod(float(y), 8.0));
  return BAYER8[yi * 8 + xi] / 64.0;
}

void main() {
  // Pixel coord snapped to tile size (so the dither cells are chunky)
  vec2 pixel = vUv * uResolution;
  vec2 cell = floor(pixel / max(uPixelSize, 1.0));

  // Procedural source: radial gradient + slow wave
  vec2 toCenter = vUv - vec2(0.5);
  float dist = length(toCenter);
  float wave = 0.5 + 0.5 * sin(uTime * 0.4 + vUv.x * 6.2831 + vUv.y * 4.0);
  float source = mix(1.0 - dist * 1.4, wave, 0.45);
  source = clamp(source, 0.0, 1.0);

  // Hover spotlight: distance from cursor (in UV space) shapes the value
  float hoverDist = length(vUv - uMouse);
  float falloff = smoothstep(0.45, 0.0, hoverDist);
  float bias = falloff * uHoverIntensity;
  if (uHoverMode == 0) {
    source += bias;
  } else {
    source -= bias;
  }
  source = clamp(source, 0.0, 1.0);

  // Bayer threshold offset, then quantize to N levels
  float t = bayerThreshold(int(cell.x), int(cell.y));
  float levels = max(float(uLevels), 2.0);
  float biased = source + (t - 0.5) / levels;
  float quantized = floor(biased * (levels - 1.0) + 0.5) / (levels - 1.0);
  quantized = clamp(quantized, 0.0, 1.0);

  vec3 color = uMonochrome == 1
    ? vec3(quantized)
    : mix(uColorA, uColorB, quantized);

  fragColor = vec4(color, 1.0);
}
`;
