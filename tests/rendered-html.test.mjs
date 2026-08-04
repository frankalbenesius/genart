import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the playground shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Genart Playground<\/title>/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("keeps sketches discoverable and independently readable", async () => {
  const sketchRoot = new URL("../sketches/", import.meta.url);
  const files = (await readdir(sketchRoot)).filter(
    (file) => file.endsWith(".js") && !file.startsWith("new-"),
  );
  const studio = await readFile(
    new URL("../app/studio.tsx", import.meta.url),
    "utf8",
  );

  assert.equal(files.length, 6);
  assert.match(studio, /import\.meta\.glob/);

  for (const file of files) {
    const source = await readFile(new URL(file, sketchRoot), "utf8");
    assert.match(source, /export const meta/);
    assert.match(source, /export default function draw/);
  }
});
