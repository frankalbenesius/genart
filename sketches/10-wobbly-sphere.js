// Adapted from createSphere.js and wobbly_orb.js in plotter-sketches.
// The geometry is intentionally sequestered in lib/wobbly-sphere.js.

import { createWobblySphereLines } from "../lib/wobbly-sphere.js";

export const meta = {
  title: "10 — Wobbly sphere",
  description:
    "A stack of 3D circles is deformed with 4D noise, rotated, and projected onto the canvas.",
  animated: true,
  parameters: [
    {
      key: "shellLines",
      label: "Shell lines",
      min: 12,
      max: 100,
      step: 1,
      default: 58,
    },
    {
      key: "arcSteps",
      label: "Arc resolution",
      min: 24,
      max: 220,
      step: 1,
      default: 120,
    },
    {
      key: "arcLength",
      label: "Arc length",
      min: 0.2,
      max: 1,
      step: 0.01,
      default: 1,
    },
    {
      key: "wobble",
      label: "Wobble",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.42,
    },
    {
      key: "rotationX",
      label: "Tilt X",
      min: -90,
      max: 90,
      step: 1,
      default: 18,
    },
    {
      key: "rotationY",
      label: "Tilt Y",
      min: -90,
      max: 90,
      step: 1,
      default: -24,
    },
  ],
};

export default function draw({
  context,
  width,
  height,
  noise4D,
  scale,
  strength,
  time,
  parameters,
}) {
  context.fillStyle = "#eee5d5";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(42, 31, 53, 0.58)";
  context.lineWidth = Math.max(1, width * 0.00085);

  const lines = createWobblySphereLines({
    center: [width * 0.5, height * 0.5],
    radius: Math.min(width, height) * 0.34,
    shellLines: parameters.shellLines,
    arcSteps: parameters.arcSteps,
    arcLength: parameters.arcLength,
    frequency: scale,
    amplitude: parameters.wobble * strength,
    time,
    noise4D,
    rotation: {
      x: (parameters.rotationX * Math.PI) / 180,
      y: (parameters.rotationY * Math.PI) / 180,
      z: time * 0.035,
    },
  });

  for (const line of lines) {
    context.beginPath();
    line.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  }
}
