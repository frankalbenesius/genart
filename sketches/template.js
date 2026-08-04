// Copy this file, rename the copy, and start drawing.
// `hidden: true` keeps this original template out of the sketch selector.
// Remove `hidden` from your copy so it appears in the playground.

export const meta = {
  title: "My sketch",
  description: "Describe the one idea this sketch explores.",
  animated: false,
  hidden: true,
};

export default function draw({ context, width, height }) {
  context.fillStyle = "#fbfaf6";
  context.fillRect(0, 0, width, height);

  // Start drawing here. All measurements are canvas pixels.
  // Other available values include:
  // noise2D, noise3D, random, scale, strength, and time.
}
