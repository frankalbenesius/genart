export const meta = {
  title: "06 — Leave the grid",
  description:
    "The grid was only a way to see the field. These paths ask the same noise function which way to move.",
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
  const pathCount = 650;
  const steps = 70;
  const stepLength = Math.min(width, height) * 0.0038;

  context.fillStyle = "#f6eee1";
  context.fillRect(0, 0, width, height);
  context.lineWidth = Math.max(0.7, width * 0.00065);
  context.strokeStyle = "rgba(22, 45, 38, 0.42)";

  for (let path = 0; path < pathCount; path += 1) {
    let x = random() * width;
    let y = random() * height;

    context.beginPath();
    context.moveTo(x, y);

    for (let step = 0; step < steps; step += 1) {
      const u = x / width;
      const v = y / height;
      const angle = noise2D(u * scale, v * scale) * Math.PI * 2 * strength;
      x += Math.cos(angle) * stepLength;
      y += Math.sin(angle) * stepLength;
      context.lineTo(x, y);
    }

    context.stroke();
  }
}
