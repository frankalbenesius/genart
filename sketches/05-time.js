export const meta = {
  title: "05 — Add time",
  description:
    "A third noise coordinate lets the same field evolve smoothly instead of rerolling every frame.",
  animated: true,
};

export default function draw({
  context,
  width,
  height,
  noise3D,
  scale,
  strength,
  time,
}) {
  const columns = 42;
  const rows = 28;
  const margin = width * 0.07;
  const unit = Math.min(width, height) * 0.019;

  context.fillStyle = "#18231f";
  context.fillRect(0, 0, width, height);
  context.lineCap = "round";
  context.lineWidth = Math.max(1, width * 0.0017);

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      const noise = noise3D(u * scale, v * scale, time * 0.18);
      const value = (noise + 1) / 2;
      const angle = noise * Math.PI * 2 * strength;
      const length = unit * (0.3 + value * strength);
      const x = margin + u * (width - margin * 2);
      const y = margin + v * (height - margin * 2);

      context.strokeStyle = `hsl(${20 + value * 42} 78% ${58 + value * 22}%)`;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(
        x + Math.cos(angle) * length,
        y + Math.sin(angle) * length,
      );
      context.stroke();
    }
  }
}
