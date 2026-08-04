export const meta = {
  title: "04 — Mapping playground",
  description:
    "One noise value now controls angle, length, color, and displacement. Change one mapping at a time.",
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
  const columns = 42;
  const rows = 28;
  const margin = width * 0.07;
  const unit = Math.min(width, height) * 0.018;

  context.fillStyle = "#f8f3e9";
  context.fillRect(0, 0, width, height);
  context.lineCap = "round";
  context.lineWidth = Math.max(1, width * 0.0015);

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      const noise = noise2D(u * scale, v * scale);
      const value = (noise + 1) / 2;
      const angle = noise * Math.PI * strength;
      const length = unit * (0.35 + value * strength);
      const x = margin + u * (width - margin * 2) + noise * unit * strength;
      const y = margin + v * (height - margin * 2) + noise * unit * strength;

      context.strokeStyle = `hsl(${18 + value * 170} 55% ${25 + value * 24}%)`;
      context.beginPath();
      context.moveTo(
        x - Math.cos(angle) * length,
        y - Math.sin(angle) * length,
      );
      context.lineTo(
        x + Math.cos(angle) * length,
        y + Math.sin(angle) * length,
      );
      context.stroke();
    }
  }
}
