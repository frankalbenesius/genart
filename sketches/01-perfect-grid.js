export const meta = {
  title: "01 — Perfect grid",
  description:
    "Start with order: every dot follows the same rule at an evenly spaced position.",
  animated: false,
};

export default function draw({ context, width, height }) {
  const columns = 28;
  const rows = 18;
  const margin = width * 0.08;
  const radius = Math.min(width, height) * 0.006;

  context.fillStyle = "#fbfaf6";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#1c1b19";

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      const x = margin + u * (width - margin * 2);
      const y = margin + v * (height - margin * 2);

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
}
