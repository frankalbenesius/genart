// The sketch only chooses parameters; all 3D construction and projection live here.

export function createWobblySphereLines({
  center,
  radius,
  shellLines,
  arcSteps,
  arcLength,
  rotation,
  frequency,
  amplitude,
  time,
  noise4D,
}) {
  const lines = [];
  const visibleArcSteps = Math.max(2, Math.round(arcSteps * arcLength));

  for (let shell = 1; shell < shellLines; shell += 1) {
    const depth = shell / shellLines;
    const circleRadius = Math.sqrt(0.25 - Math.pow(0.5 - depth, 2));
    const line = [];

    for (let step = 0; step <= visibleArcSteps; step += 1) {
      const angle = (step / arcSteps) * Math.PI * 2;
      const point = [
        0.5 + Math.cos(angle) * circleRadius,
        0.5 + Math.sin(angle) * circleRadius,
        depth,
      ];
      const noise = noise4D(
        point[0] * frequency,
        point[1] * frequency,
        point[2] * frequency,
        time * 0.22,
      );
      const wobble = 1 + noise * amplitude * 0.24;
      const wobbled = point.map((value) => 0.5 + (value - 0.5) * wobble);
      const rotated = rotatePoint(wobbled, rotation);

      line.push([
        center[0] + (rotated[0] - 0.5) * radius * 2,
        center[1] + (rotated[1] - 0.5) * radius * 2,
      ]);
    }
    lines.push(line);
  }

  return lines;
}

function rotatePoint(point, rotation) {
  let [x, y, z] = point.map((value) => value - 0.5);

  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);
  [y, z] = [y * cosX - z * sinX, y * sinX + z * cosX];

  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  [x, z] = [x * cosY + z * sinY, -x * sinY + z * cosY];

  const cosZ = Math.cos(rotation.z);
  const sinZ = Math.sin(rotation.z);
  [x, y] = [x * cosZ - y * sinZ, x * sinZ + y * cosZ];

  return [x + 0.5, y + 0.5, z + 0.5];
}
