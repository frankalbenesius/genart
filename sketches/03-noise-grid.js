export const meta = {
  title: "03 — Noise grid",
  description:
    "Noise gives nearby coordinates related values. Scale controls detail; strength controls influence.",
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
  const columns = 34;
  const rows = 22;
  const margin = width * 0.08;
  const unit = Math.min(width, height) * 0.011;

  context.fillStyle = "#fbfaf6";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#1c1b19";

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      const x = margin + u * (width - margin * 2);
      const y = margin + v * (height - margin * 2);
      const noise = noise2D(u * scale, v * scale); // -1 to 1
      const value = (noise + 1) / 2; // 0 to 1
      const radius = unit * (0.1 + value * strength);

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
}
