// Adapted from sketches/archive/190410/faces_1.js in plotter-sketches.

export const meta = {
  title: "09 — Faces",
  description:
    "Several samples from one field become gaze, expression, and imperfect outlines.",
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
  const columns = 12;
  const rows = 8;
  const margin = width * 0.045;
  const cellWidth = (width - margin * 2) / columns;
  const cellHeight = (height - margin * 2) / rows;
  const faceRadius = Math.min(cellWidth, cellHeight) * 0.36;

  context.fillStyle = "#f7f0df";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#342f2b";
  context.lineWidth = Math.max(1, width * 0.00115);
  context.lineCap = "round";

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const u = column / (columns - 1);
      const v = row / (rows - 1);
      const centerX = margin + cellWidth * (column + 0.5);
      const centerY = margin + cellHeight * (row + 0.5);
      const look = noise2D(u * scale, v * scale) * Math.PI * 2;
      const mood = noise2D(u * scale + 100, v * scale + 100);

      drawFace(context, {
        centerX,
        centerY,
        radius: faceRadius,
        look,
        mood,
        noise2D,
        scale,
        strength,
      });
    }
  }
}

function drawFace(
  context,
  { centerX, centerY, radius, look, mood, noise2D, scale, strength },
) {
  const outlineSteps = 42;
  context.beginPath();
  for (let step = 0; step <= outlineSteps; step += 1) {
    const angle = (step / outlineSteps) * Math.PI * 2;
    const wobble =
      1 +
      noise2D(
        Math.cos(angle) * scale + centerX * 0.001,
        Math.sin(angle) * scale + centerY * 0.001,
      ) *
        0.08 *
        strength;
    const x = centerX + Math.cos(angle) * radius * wobble;
    const y = centerY + Math.sin(angle) * radius * 1.1 * wobble;
    if (step === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();

  const eyeGap = radius * 0.36;
  const eyeRadius = Math.max(1.5, radius * 0.085);
  const eyeShiftX = Math.cos(look) * radius * 0.18;
  const eyeShiftY = Math.sin(look) * radius * 0.12;
  context.fillStyle = "#342f2b";
  for (const side of [-1, 1]) {
    context.beginPath();
    context.arc(
      centerX + side * eyeGap + eyeShiftX,
      centerY - radius * 0.18 + eyeShiftY,
      eyeRadius,
      0,
      Math.PI * 2,
    );
    context.fill();
  }

  const mouthY = centerY + radius * 0.38;
  const mouthWidth = radius * 0.65;
  context.beginPath();
  context.moveTo(centerX - mouthWidth / 2, mouthY);
  context.quadraticCurveTo(
    centerX,
    mouthY + mood * radius * 0.32 * strength,
    centerX + mouthWidth / 2,
    mouthY,
  );
  context.stroke();
}
