// Adapted from sketches/archive/190322/hairy_1.js in plotter-sketches.

export const meta = {
  title: "08 — Hair field",
  description:
    "Noise bends both the roots and growth direction of many small paths into an organic surface.",
  animated: false,
};

export default function draw({
  context,
  width,
  height,
  noise2D,
  random,
  scale,
  strength,
}) {
  const rows = 52;
  const columns = 34;
  const margin = width * 0.08;
  const stepLength = Math.min(width, height) * 0.0035;
  const roots = [];

  context.fillStyle = "#efe4d2";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(59, 37, 29, 0.52)";
  context.lineWidth = Math.max(0.8, width * 0.0007);
  context.lineCap = "round";

  for (let row = 0; row < rows; row += 1) {
    const rootRow = [];
    for (let column = 0; column < columns; column += 1) {
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      const bendX = noise2D(u * scale, v * scale) * 0.055 * strength;
      const bendY = noise2D(u * scale + 100, v * scale + 100) * 0.055 * strength;
      rootRow.push([u + bendX, v + bendY]);
    }
    roots.push(rootRow);
  }

  roots.forEach((rootRow) => {
    rootRow.forEach(([u, v], column) => {
      if (random() < 0.62) return;

      const previous = rootRow[Math.max(0, column - 1)];
      let angle = Math.atan2(v - previous[1], u - previous[0]) - Math.PI / 2;
      let x = margin + u * (width - margin * 2);
      let y = margin + v * (height - margin * 2);

      context.beginPath();
      context.moveTo(x, y);
      for (let step = 0; step < 62; step += 1) {
        const turn = noise2D(
          (x / width) * scale * 5,
          (y / height) * scale * 5,
        );
        angle += turn * 0.12 * strength;
        x += Math.cos(angle) * stepLength;
        y += Math.sin(angle) * stepLength;
        context.lineTo(x, y);
      }
      context.stroke();
    });
  });
}
