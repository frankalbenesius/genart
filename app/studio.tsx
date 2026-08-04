"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { exportPng, renderSketch, resizeCanvasToDisplaySize } from "../lib/runtime";
import newSketchSource from "../sketches/new-sketch-template.js?raw";

type SketchMeta = {
  title: string;
  description: string;
  animated: boolean;
};

type SketchModule = {
  default: (properties: Record<string, unknown>) => void;
  meta: SketchMeta;
};

const sketchModules = import.meta.glob<SketchModule>("../sketches/*.js", {
  eager: true,
});

const sketches = Object.entries(sketchModules)
  .filter(([path]) => !path.split("/").pop()?.startsWith("new-"))
  .map(([path, module]) => ({
    id: path.split("/").pop()?.replace(".js", "") ?? path,
    draw: module.default,
    ...module.meta,
  }))
  .sort((first, second) => first.title.localeCompare(second.title));

function readInitialState() {
  if (typeof window === "undefined") {
    return { sketch: "03-noise-grid", seed: "workshop", scale: 3, strength: 1 };
  }

  const query = new URLSearchParams(window.location.search);
  return {
    sketch: query.get("sketch") ?? "03-noise-grid",
    seed: query.get("seed") ?? "workshop",
    scale: Number(query.get("scale")) || 3,
    strength: Number(query.get("strength")) || 1,
  };
}

export function Studio() {
  const [initial] = useState(() => readInitialState());
  const [sketchId, setSketchId] = useState(initial.sketch);
  const [seed, setSeed] = useState(initial.seed);
  const [scale, setScale] = useState(initial.scale);
  const [strength, setStrength] = useState(initial.strength);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedAt = useRef(0);
  const elapsedAtPause = useRef(0);
  const selected = sketches.find((sketch) => sketch.id === sketchId) ?? sketches[0];

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams({
      sketch: selected.id,
      seed,
      scale: String(scale),
      strength: String(strength),
    });
    window.history.replaceState(null, "", `?${query}`);
  }, [selected.id, seed, scale, strength]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrame = 0;
    if (startedAt.current === 0) startedAt.current = performance.now();
    const observer = new ResizeObserver(() => resizeCanvasToDisplaySize(canvas));
    observer.observe(canvas);

    const frame = (now: number) => {
      resizeCanvasToDisplaySize(canvas);
      const time = paused
        ? elapsedAtPause.current
        : elapsedAtPause.current + (now - startedAt.current) / 1000;
      renderSketch({
        canvas,
        sketch: selected.draw,
        seed,
        scale,
        strength,
        time,
      });

      if (selected.animated && !paused) {
        animationFrame = requestAnimationFrame(frame);
      }
    };

    animationFrame = requestAnimationFrame(frame);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [selected, seed, scale, strength, paused]);

  const saveImage = useCallback(() => {
    const time = paused
      ? elapsedAtPause.current
      : elapsedAtPause.current + (performance.now() - startedAt.current) / 1000;

    exportPng({
      sketch: selected.draw,
      seed,
      scale,
      strength,
      time,
      filename: `${selected.id}-${seed}.png`,
    });
    showToast("Exported a 2400 × 1600 PNG");
  }, [selected, seed, scale, strength, paused, showToast]);

  const togglePaused = () => {
    const now = performance.now();
    if (paused) {
      startedAt.current = now;
    } else {
      elapsedAtPause.current += (now - startedAt.current) / 1000;
    }
    setPaused((value) => !value);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "s" && !(event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        saveImage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveImage]);

  const newSketch = () => {
    const blob = new Blob([newSketchSource], { type: "text/javascript" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "my-sketch.js";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("Downloaded my-sketch.js — move it into /sketches");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    showToast("Copied this sketch URL");
  };

  return (
    <main className="studio">
      <aside className="sidebar">
        <p className="eyebrow">Genart playground</p>
        <h1>Noise, made visible.</h1>
        <p className="description">{selected.description}</p>

        <div className="control">
          <label htmlFor="sketch">Sketch</label>
          <select
            id="sketch"
            value={selected.id}
            onChange={(event) => {
              setSketchId(event.target.value);
              setPaused(false);
              elapsedAtPause.current = 0;
              startedAt.current = performance.now();
            }}
          >
            {sketches.map((sketch) => (
              <option key={sketch.id} value={sketch.id}>
                {sketch.title}
              </option>
            ))}
          </select>
        </div>

        <div className="control">
          <div className="control-row">
            <label htmlFor="seed">Seed</label>
          </div>
          <div className="seed-row">
            <input
              id="seed"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
            />
            <button
              type="button"
              aria-label="Choose a random seed"
              onClick={() => setSeed(Math.random().toString(36).slice(2, 8))}
            >
              ↻
            </button>
          </div>
        </div>

        <div className="control">
          <div className="control-row">
            <label htmlFor="scale">Scale · frequency</label>
            <output>{scale.toFixed(1)}</output>
          </div>
          <input
            id="scale"
            type="range"
            min="0.2"
            max="10"
            step="0.1"
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
          />
        </div>

        <div className="control">
          <div className="control-row">
            <label htmlFor="strength">Strength · amplitude</label>
            <output>{strength.toFixed(1)}</output>
          </div>
          <input
            id="strength"
            type="range"
            min="0"
            max="2.5"
            step="0.1"
            value={strength}
            onChange={(event) => setStrength(Number(event.target.value))}
          />
        </div>

        <div className="actions">
          {selected.animated ? (
            <button type="button" onClick={togglePaused}>
              {paused ? "Play" : "Pause"}
            </button>
          ) : (
            <button type="button" onClick={copyLink}>
              Copy link
            </button>
          )}
          <button type="button" className="primary" onClick={saveImage}>
            Export PNG
          </button>
          <button type="button" className="wide" onClick={newSketch}>
            Download new sketch
          </button>
        </div>
        <p className="hint">
          Press S to export. Add a file to <code>/sketches</code> and it appears
          here automatically.
        </p>
      </aside>

      <section className="canvas-area" aria-label="Sketch preview">
        <div className="canvas-frame">
          <canvas ref={canvasRef} />
        </div>
        {toast ? <div className="toast">{toast}</div> : null}
      </section>
    </main>
  );
}
