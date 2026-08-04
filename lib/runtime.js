import { createNoise2D, createNoise3D } from "simplex-noise";
import { createRandom } from "./random";

export function renderSketch({ canvas, sketch, seed, scale, strength, time }) {
  const context = canvas.getContext("2d");

  if (!context) return;

  const random = createRandom(seed);
  const noiseRandom = createRandom(seed);
  const noise2D = createNoise2D(noiseRandom);
  const noise3D = createNoise3D(createRandom(seed));

  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  sketch({
    context,
    width: canvas.width,
    height: canvas.height,
    noise2D,
    noise3D,
    random,
    scale,
    strength,
    time,
  });
  context.restore();
}

export function resizeCanvasToDisplaySize(canvas) {
  const bounds = canvas.getBoundingClientRect();
  const density = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(bounds.width * density));
  const height = Math.max(1, Math.round(bounds.height * density));

  if (canvas.width === width && canvas.height === height) return false;

  canvas.width = width;
  canvas.height = height;
  return true;
}

export function exportPng({ sketch, seed, scale, strength, time, filename }) {
  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = 1600;

  renderSketch({ canvas, sketch, seed, scale, strength, time });

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
