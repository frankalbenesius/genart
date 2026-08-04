import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("the page exposes the workshop controls and canvas", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /<canvas id="canvas">/);
  assert.match(html, /id="sketch"/);
  assert.match(html, /id="scale"/);
  assert.match(html, /id="strength"/);
  assert.match(html, /id="sketch-controls"/);
  assert.match(html, /Export PNG/);
  assert.match(html, /Record 6s WebM/);
  assert.match(html, /https:\/\/github\.com\/frankalbenesius\/genart/);
});

test("keeps sketches discoverable and independently readable", async () => {
  const sketchRoot = new URL("../sketches/", import.meta.url);
  const files = (await readdir(sketchRoot)).filter(
    (file) => file.endsWith(".js") && file !== "template.js",
  );
  const studio = await readFile(
    new URL("../src/main.js", import.meta.url),
    "utf8",
  );

  assert.equal(files.length, 9);
  assert.match(studio, /import\.meta\.glob/);
  assert.match(studio, /!module\.meta\.hidden/);

  const template = await readFile(new URL("template.js", sketchRoot), "utf8");
  assert.match(template, /hidden: true/);

  for (const file of files) {
    const source = await readFile(new URL(file, sketchRoot), "utf8");
    assert.match(source, /export const meta/);
    assert.match(source, /export default function draw/);
  }
});

test("keeps playground state out of the URL", async () => {
  const studio = await readFile(
    new URL("../src/main.js", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(studio, /URLSearchParams|history\.replaceState|location\.search/);
});
