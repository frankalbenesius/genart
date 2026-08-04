// Adapted from sketches/6x4/plateaus.js in frankalbenesius/plotter-sketches.

export const meta = {
  title: "07 — Plateaus",
  description:
    "The same noise field displaces a connected grid, turning orderly topology into terrain.",
  animated: false,
};

export default function draw({
  context,
  width,
  height,
  noise2D,
  scale,
  strength,
}) {
  const columns = 72;
  const rows = 48;
  const margin = width * 0.06;
  const displacement = Math.min(width, height) * 0.065 * strength;
  const points = [];

  context.fillStyle = "#f4efe4";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(28, 27, 25, 0.42)";
  context.lineWidth = Math.max(0.7, width * 0.00065);

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      const noise = noise2D(u * scale, v * scale);
      points.push([
        margin + u * (width - margin * 2) + noise * displacement,
        margin + v * (height - margin * 2) + noise * displacement,
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
