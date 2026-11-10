import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import test from "node:test";
import { LETTER_DEFINITIONS } from "../app/lib/cues.ts";
import { letterExamples } from "../app/lib/letter-examples.ts";

test("every Spanish letter name and composite callout has a substantive audio asset", () => {
  const names = [];
  const callouts = [];

  for (const definition of LETTER_DEFINITIONS) {
    names.push(`/audio/es-419/${definition.id}.name.mp3`);
    for (const example of letterExamples("es-419", definition.display)) {
      callouts.push(example.audioCallout);
    }
  }

  assert.equal(names.length, 27);
  assert.equal(callouts.length, 81);

  for (const audioPath of names) {
    const asset = new URL(`../public${audioPath}`, import.meta.url);
    assert.equal(existsSync(asset), true, audioPath);
    assert.ok(statSync(asset).size > 3_000, audioPath);
  }

  for (const audioPath of callouts) {
    const asset = new URL(`../public${audioPath}`, import.meta.url);
    assert.equal(existsSync(asset), true, audioPath);
    assert.ok(statSync(asset).size > 20_000, audioPath);
  }
});
