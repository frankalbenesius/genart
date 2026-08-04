export const meta = {
  title: "02 — Random grid",
  description:
    "Random values make variation, but neighboring dots know nothing about each other.",
  animated: false,
};

export default function draw({ context, width, height, random, strength }) {
  const columns = 28;
  const rows = 18;
  const margin = width * 0.08;
  const unit = Math.min(width, height) * 0.012;

  context.fillStyle = "#fbfaf6";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#1c1b19";

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      const x = margin + u * (width - margin * 2);
      const y = margin + v * (height - margin * 2);
      const radius = unit * (0.12 + random() * strength);

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
}
