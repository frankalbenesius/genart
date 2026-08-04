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

export async function exportWebm({
  canvas,
  filename,
  duration = 6000,
  onProgress = () => {},
}) {
  if (!canvas.captureStream || !window.MediaRecorder) {
    throw new Error("This browser does not support canvas recording.");
  }

  const mimeType = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ].find((type) => MediaRecorder.isTypeSupported(type));

  if (!mimeType) {
    throw new Error("This browser cannot encode WebM video.");
  }

  const stream = canvas.captureStream(60);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];
  const startedAt = performance.now();

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });

  const finished = new Promise((resolve, reject) => {
    recorder.addEventListener("stop", resolve, { once: true });
    recorder.addEventListener("error", (event) => reject(event.error), {
      once: true,
    });
  });

  recorder.start(250);
  const progressTimer = window.setInterval(() => {
    const elapsed = performance.now() - startedAt;
    onProgress(Math.max(0, Math.ceil((duration - elapsed) / 1000)));
  }, 200);
  window.setTimeout(() => recorder.stop(), duration);

  await finished;
  window.clearInterval(progressTimer);
  stream.getTracks().forEach((track) => track.stop());

  const video = new Blob(chunks, { type: mimeType });
  const url = URL.createObjectURL(video);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
