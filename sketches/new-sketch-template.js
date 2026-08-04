// Copy this file, rename it, and it will appear in the sketch selector.
// Files beginning with "new-" are intentionally hidden from the selector.

export const meta = {
  title: "My sketch",
  description: "Describe the one idea this sketch explores.",
  animated: false,
};

export default function draw({
  context,
  width,
  height,
}) {
  context.fillStyle = "#fbfaf6";
  context.fillRect(0, 0, width, height);

  // Start drawing here. All measurements are canvas pixels.
  // noise2D(x * scale, y * scale) returns a value from about -1 to 1.
  // random() is seeded, so the same seed recreates the same image.
}
