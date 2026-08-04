# Genart Playground

A small, readable JavaScript playground for learning generative art with noise.

The project is deliberately narrower than a creative-coding framework. It gives
you a canvas, deterministic randomness, 2D and 3D simplex noise, a time value,
a few controls, and high-resolution PNG export. The interesting code stays in
individual sketch files.

## Start locally

This project requires Node.js 20.19 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal. Start with **01 — Perfect grid** in
the sketch selector and move through the examples in order.

## Make a sketch

Copy [`sketches/template.js`](./sketches/template.js), remove `hidden: true`,
and give the copy a useful filename:

```text
sketches/my-wobbly-lines.js
```

The selector uses Vite's `import.meta.glob` to find `sketches/*.js`. During
development, adding or renaming a file refreshes the page and updates the
selector. A production build bundles every sketch that existed at build time.
Any sketch with `meta.hidden: true` stays out of the selector.

Every sketch exports some display information and one drawing function:

```js
export const meta = {
  title: "My sketch",
  description: "Describe the one idea this sketch explores.",
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
  time,
}) {
  context.fillStyle = "#fbfaf6";
  context.fillRect(0, 0, width, height);

  // Draw here.
}
```

The drawing function receives:

- `context`: the browser's Canvas 2D drawing context
- `width`, `height`: the canvas size in pixels
- `random()`: seeded randomness from 0 to 1
- `noise2D(x, y)`: seeded simplex noise from roughly -1 to 1
- `noise3D(x, y, z)`: the same idea with a third coordinate for time
- `scale`: the value from the scale/frequency control
- `strength`: the value from the strength/amplitude control
- `time`: seconds since animation began

Set `meta.animated` to `true` when the drawing uses `time`. Static sketches only
redraw when their inputs change.

### Sketch-specific controls

A sketch can declare extra sliders alongside its metadata:

```js
export const meta = {
  title: "My adjustable sketch",
  animated: false,
  parameters: [
    {
      key: "count",
      label: "Count",
      min: 10,
      max: 100,
      step: 1,
      default: 40,
    },
  ],
};
```

The drawing function receives the current values as `parameters.count`. The
runtime creates the controls and keeps their values in memory while you work.

## Save your work

Press `S` or click **Export PNG** to render a 2400 × 2400 PNG. Exports use the
same seed and controls as the visible sketch.

Animated sketches also show **Record 6s WebM**. Recording captures the visible
canvas at 60 frames per second using the browser's `MediaRecorder` API. Browser
support varies, so PNG remains the dependable export path.

Sketch and control changes do not alter the URL. Reloading the page resets the
playground to its defaults, so export an image or animation to keep a result.

Canvas is immediate-mode rather than retained vector geometry, so the runtime
does not pretend it can automatically export useful SVG. A future sketch can
record paths explicitly when vector output matters.

## A 30-minute workshop path

1. **Perfect grid:** positions as normalized `u` and `v` coordinates.
2. **Random grid:** variation without relationships between neighbors.
3. **Noise grid:** nearby coordinates receive related values.
4. **Mapping playground:** one value controls size, angle, color, or position.
5. Change the seed, scale, and strength, then export an image.

With another 15 minutes, add **Add time** and **Leave the grid**. The latter
shows that a grid only visualizes the field; any point or moving path can sample
it.

The remaining sketches are optional demos adapted from Frank's older plotter
work: **Plateaus** distorts connected topology, **Faces** maps noise onto more
semantic visual decisions, and **Wobbly sphere** uses 4D noise to deform a
rotating stack of projected 3D arcs.

## Where to keep exploring

- [MDN Canvas tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [MDN basic animations](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations)
- [simplex-noise.js](https://github.com/jwagner/simplex-noise.js)
- [canvas-sketch](https://github.com/mattdesl/canvas-sketch)
- [Frank's older plotter sketches](https://github.com/frankalbenesius/plotter-sketches)
- [The Nature of Code: Randomness](https://natureofcode.com/random/)

The runtime lives in [`lib/runtime.js`](./lib/runtime.js), the seeded random
function in [`lib/random.js`](./lib/random.js), and the selector and controls in
[`src/main.js`](./src/main.js). There is intentionally not much more to it: the
only runtime dependency is `simplex-noise`, and Vite is only the development
server and build tool.
