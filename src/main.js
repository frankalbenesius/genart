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
  sketchControls: document.querySelector("#sketch-controls"),
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

const initialSketchId = state.sketchId;
const parameterValues = new Map();

function selectedSketch() {
  return sketches.find((sketch) => sketch.id === state.sketchId);
}

function parametersFor(sketch) {
  if (!parameterValues.has(sketch.id)) {
    const values = {};
    for (const parameter of sketch.parameters ?? []) {
      const rawQueryValue = query.get(`param-${parameter.key}`);
      const queryValue =
        sketch.id === initialSketchId && rawQueryValue !== null
          ? Number(rawQueryValue)
          : Number.NaN;
      values[parameter.key] = Number.isFinite(queryValue)
        ? queryValue
        : parameter.default;
    }
    parameterValues.set(sketch.id, values);
  }
  return parameterValues.get(sketch.id);
}

function formatParameter(parameter, value) {
  const decimals = String(parameter.step).split(".")[1]?.length ?? 0;
  return Number(value).toFixed(decimals);
}

function buildSketchControls() {
  const sketch = selectedSketch();
  const values = parametersFor(sketch);
  elements.sketchControls.replaceChildren();

  for (const parameter of sketch.parameters ?? []) {
    const wrapper = document.createElement("div");
    wrapper.className = "control";

    const row = document.createElement("div");
    row.className = "control-row";
    const label = document.createElement("label");
    label.htmlFor = `parameter-${parameter.key}`;
    label.textContent = parameter.label;
    const output = document.createElement("output");
    output.dataset.parameterOutput = parameter.key;
    output.value = formatParameter(parameter, values[parameter.key]);
    row.append(label, output);

    const input = document.createElement("input");
    input.id = `parameter-${parameter.key}`;
    input.type = "range";
    input.min = String(parameter.min);
    input.max = String(parameter.max);
    input.step = String(parameter.step);
    input.value = String(values[parameter.key]);
    values[parameter.key] = Number(input.value);
    output.value = formatParameter(parameter, values[parameter.key]);
    input.addEventListener("input", () => {
      values[parameter.key] = Number(input.value);
      output.value = formatParameter(parameter, input.value);
      changed();
    });

    wrapper.append(row, input);
    elements.sketchControls.append(wrapper);
  }
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
  const sketch = selectedSketch();
  const values = parametersFor(sketch);
  for (const parameter of sketch.parameters ?? []) {
    nextQuery.set(`param-${parameter.key}`, String(values[parameter.key]));
  }
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

  const values = parametersFor(sketch);
  for (const parameter of sketch.parameters ?? []) {
    const output = elements.sketchControls.querySelector(
      `[data-parameter-output="${parameter.key}"]`,
    );
    if (output) output.value = formatParameter(parameter, values[parameter.key]);
  }
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
    parameters: parametersFor(sketch),
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
    parameters: parametersFor(sketch),
    filename: `${sketch.id}-${state.seed}.png`,
  });
  showToast("Exported a 2400 × 2400 PNG");
}

elements.sketch.addEventListener("change", (event) => {
  state.sketchId = event.target.value;
  state.scale = 3;
  state.strength = 1;
  state.paused = false;
  elapsedAtPause = 0;
  startedAt = performance.now();
  parameterValues.delete(state.sketchId);
  buildSketchControls();
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
buildSketchControls();
updateControls();
updateUrl();
draw();
