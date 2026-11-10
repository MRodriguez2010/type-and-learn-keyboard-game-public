import assert from "node:assert/strict";
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

test("server-renders the Type & Learn Keyboard Game home screen", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Type &amp; Learn Keyboard Game<\/title>/i,
  );
  assert.match(html, /Type &amp;/);
  assert.match(html, /Learn/);
  assert.match(html, /Keyboard Game/);
  assert.match(html, /Listen\./);
  assert.match(html, /Copy\./);
  assert.match(html, /Voices are getting ready/);
  assert.match(html, /data-testid="start-game"/);
  assert.match(html, /data-testid="start-talk-point"/);
  assert.match(html, /data-testid="start-find-it"/);
  assert.match(html, /Talk &amp; Point/);
  assert.match(html, /Find It/);
  assert.match(html, /No timer or score/);
  assert.match(html, /data-testid="open-settings"/);
  assert.match(html, /aria-label="Settings"/);
  assert.match(html, /title="Settings"/);
  assert.doesNotMatch(html, />Settings</);
  assert.doesNotMatch(html, /data-testid="keyboard-exit-help"/);
  assert.doesNotMatch(html, /data-testid="touch-exit-help"/);
  assert.match(html, /Guardian supervision recommended/);
  assert.doesNotMatch(html, /Made for touchscreens, too/);
  assert.match(html, /Created with/);
  assert.match(html, /♥/);
  assert.match(html, /for Nico &amp; Mateo/);
  assert.doesNotMatch(html, /Made with|for Nico\./);
  assert.doesNotMatch(html, /❤️|Voice clips are AI-generated/);
  assert.match(html, /data-theme="school"/);
  assert.match(html, /school-sprite\.png/);
  assert.match(html, /data-animation-movement="175"/);
  assert.equal(
    html.match(/class="scenery-motif"/g)?.length,
    24,
    "home screen should render twenty-four individually animated doodles",
  );
  for (let tile = 0; tile < 12; tile += 1) {
    assert.equal(
      html.match(new RegExp(`data-doodle-tile="${tile}"`, "g"))?.length,
      2,
      `sprite tile ${tile} should appear once in each scenery band`,
    );
  }
  assert.doesNotMatch(html, /Start with saved settings/);
  assert.doesNotMatch(html, /Parent settings/);
  assert.doesNotMatch(
    html,
    /English · School · 3-second turn · Gentle motion/,
  );
  assert.doesNotMatch(html, /lucide-/i);
  assert.doesNotMatch(html, /12345|Codex is working|starter loading/i);
});
