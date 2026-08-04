// Adapted from sketches/6x4/plateaus.js in frankalbenesius/plotter-sketches.

export const meta = {
  title: "07 — Plateaus",
  description:
    "The same noise field displaces a connected grid, turning orderly topology into terrain.",
  animated: false,
  parameters: [
    { key: "columns", label: "Columns", min: 16, max: 120, step: 1, default: 72 },
    { key: "rows", label: "Rows", min: 12, max: 80, step: 1, default: 48 },
    {
      key: "displacement",
      label: "Displacement",
      min: 0,
      max: 0.18,
      step: 0.005,
      default: 0.065,
    },
    {
      key: "clamp",
      label: "Clamp",
      min: 0.01,
      max: 1,
      step: 0.01,
      default: 0.1,
    },
    {
      key: "direction",
      label: "Direction",
      min: -180,
      max: 180,
      step: 1,
      default: 45,
    },
    {
      key: "opacity",
      label: "Line opacity",
      min: 0.1,
      max: 1,
      step: 0.05,
      default: 0.4,
    },
  ],
};

export default function draw({
  context,
  width,
  height,
  noise2D,
  scale,
  strength,
  parameters,
}) {
  const { columns, rows, displacement, clamp, direction, opacity } =
    parameters;
  const margin = width * 0.06;
  const shift = Math.min(width, height) * displacement * strength;
  const angle = (direction * Math.PI) / 180;
  const points = [];

  context.fillStyle = "#f4efe4";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = `rgba(28, 27, 25, ${opacity})`;
  context.lineWidth = Math.max(0.7, width * 0.00065);

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      const noise = noise2D(u * scale, v * scale);
      const clampedNoise = Math.max(-clamp, Math.min(clamp, noise));
      points.push([
        margin +
          u * (width - margin * 2) +
          Math.cos(angle) * clampedNoise * shift,
        margin +
          v * (height - margin * 2) +
          Math.sin(angle) * clampedNoise * shift,
      ]);
    }
  }

  for (let column = 0; column < columns; column += 1) {
    context.beginPath();
    for (let row = 0; row < rows; row += 1) {
      const [x, y] = points[column * rows + row];
      if (row === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }

  for (let row = 0; row < rows; row += 1) {
    context.beginPath();
    for (let column = 0; column < columns; column += 1) {
      const [x, y] = points[column * rows + row];
      if (column === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
}
