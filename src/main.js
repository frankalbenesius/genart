import "./style.css";
import {
  exportPng,
  exportWebm,
  renderSketch,
  resizeCanvasToDisplaySize,
} from "../lib/runtime";

const modules = import.meta.glob("../sketches/*.js", { eager: true });
const sketches = Object.entries(modules)
  .filter(([, module]) => !module.meta.hidden)
  .map(([path, module]) => ({
    id: path.split("/").pop().replace(".js", ""),
    draw: module.default,
    ...module.meta,
  }))
  .sort((first, second) => first.title.localeCompare(second.title));

const elements = {
  canvas: document.querySelector("#canvas"),
  description: document.querySelector("#description"),
  sketch: document.querySelector("#sketch"),
  seed: document.querySelector("#seed"),
  randomize: document.querySelector("#randomize"),
  scale: document.querySelector("#scale"),
  scaleValue: document.querySelector("#scale-value"),
  strength: document.querySelector("#strength"),
  strengthValue: document.querySelector("#strength-value"),
  secondaryAction: document.querySelector("#secondary-action"),
  export: document.querySelector("#export"),
  recordWebm: document.querySelector("#record-webm"),
  toast: document.querySelector("#toast"),
};

const query = new URLSearchParams(window.location.search);
const state = {
  sketchId: query.get("sketch") ?? "03-noise-grid",
  seed: query.get("seed") ?? "workshop",
  scale: Number(query.get("scale")) || 3,
  strength: Number(query.get("strength")) || 1,
  paused: false,
};

let startedAt = performance.now();
let elapsedAtPause = 0;
let animationFrame = 0;
let toastTimeout = 0;

for (const sketch of sketches) {
  const option = document.createElement("option");
  option.value = sketch.id;
  option.textContent = sketch.title;
  elements.sketch.append(option);
}

if (!sketches.some((sketch) => sketch.id === state.sketchId)) {
  state.sketchId = sketches[0].id;
}

function selectedSketch() {
  return sketches.find((sketch) => sketch.id === state.sketchId);
}

function currentTime(now = performance.now()) {
  if (state.paused) return elapsedAtPause;
  return elapsedAtPause + (now - startedAt) / 1000;
}

function updateUrl() {
  const nextQuery = new URLSearchParams({
    sketch: state.sketchId,
    seed: state.seed,
    scale: String(state.scale),
    strength: String(state.strength),
  });
  window.history.replaceState(null, "", `?${nextQuery}`);
}

function updateControls() {
  const sketch = selectedSketch();
  elements.sketch.value = sketch.id;
  elements.seed.value = state.seed;
  elements.scale.value = String(state.scale);
  elements.strength.value = String(state.strength);
  elements.scaleValue.value = state.scale.toFixed(1);
  elements.strengthValue.value = state.strength.toFixed(1);
  elements.description.textContent = sketch.description;
  elements.secondaryAction.hidden = !sketch.animated;
  elements.secondaryAction.textContent = state.paused ? "Play" : "Pause";
  elements.recordWebm.hidden = !sketch.animated;
  elements.export.classList.toggle("wide", !sketch.animated);
}

function draw(now = performance.now()) {
  cancelAnimationFrame(animationFrame);
  resizeCanvasToDisplaySize(elements.canvas);

  const sketch = selectedSketch();
  renderSketch({
    canvas: elements.canvas,
    sketch: sketch.draw,
    seed: state.seed,
    scale: state.scale,
    strength: state.strength,
    time: currentTime(now),
  });

  if (sketch.animated && !state.paused) {
    animationFrame = requestAnimationFrame(draw);
  }
}

function changed() {
  updateControls();
  updateUrl();
  draw();
}

function showToast(message) {
  clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  toastTimeout = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 2800);
}

function saveImage() {
  const sketch = selectedSketch();
  exportPng({
    sketch: sketch.draw,
    seed: state.seed,
    scale: state.scale,
    strength: state.strength,
    time: currentTime(),
    filename: `${sketch.id}-${state.seed}.png`,
  });
  showToast("Exported a 2400 × 1600 PNG");
}

elements.sketch.addEventListener("change", (event) => {
  state.sketchId = event.target.value;
  state.paused = false;
  elapsedAtPause = 0;
  startedAt = performance.now();
  changed();
});

elements.seed.addEventListener("input", (event) => {
  state.seed = event.target.value;
  changed();
});

elements.randomize.addEventListener("click", () => {
  state.seed = Math.random().toString(36).slice(2, 8);
  changed();
});

elements.scale.addEventListener("input", (event) => {
  state.scale = Number(event.target.value);
  changed();
});

elements.strength.addEventListener("input", (event) => {
  state.strength = Number(event.target.value);
  changed();
});

elements.secondaryAction.addEventListener("click", () => {
  const now = performance.now();
  if (state.paused) {
    startedAt = now;
  } else {
    elapsedAtPause += (now - startedAt) / 1000;
  }
  state.paused = !state.paused;
  changed();
});

elements.export.addEventListener("click", saveImage);

elements.recordWebm.addEventListener("click", async () => {
  const sketch = selectedSketch();
  if (!sketch.animated) return;

  if (state.paused) {
    startedAt = performance.now();
    state.paused = false;
    changed();
  }

  elements.recordWebm.disabled = true;
  elements.recordWebm.textContent = "Recording 6…";

  try {
    await exportWebm({
      canvas: elements.canvas,
      filename: `${sketch.id}-${state.seed}.webm`,
      onProgress(seconds) {
        elements.recordWebm.textContent = `Recording ${seconds}…`;
      },
    });
    showToast("Exported a 6-second WebM");
  } catch (error) {
    showToast(error.message);
  } finally {
    elements.recordWebm.disabled = false;
    elements.recordWebm.textContent = "Record 6s WebM";
  }
});

window.addEventListener("keydown", (event) => {
  if (event.target.matches("input, select")) return;
  if (event.key.toLowerCase() === "s" && !(event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    saveImage();
  }
});

new ResizeObserver(() => draw()).observe(elements.canvas);
updateControls();
updateUrl();
draw();
