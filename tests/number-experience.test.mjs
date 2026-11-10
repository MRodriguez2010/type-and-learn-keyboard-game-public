import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";

import {
  NUMBER_DIGITS,
  numberCalloutAudioPathsFor,
  numberExperience,
  numberExperienceFromCue,
} from "../app/lib/number-experience.ts";

test("every digit has a bilingual playful sound blend", () => {
  for (const language of ["en-US", "es-419"]) {
    for (const digit of NUMBER_DIGITS) {
      const experience = numberExperience(digit, language);
      assert.ok(experience);
      assert.ok(experience.soundLead.length > 0);
      assert.ok(experience.completion.length > 0);
      assert.equal(
        experience.phoneticDisplay,
        `${experience.soundLead}…${experience.completion}`,
      );
      assert.equal(
        experience.spokenCallout,
        `${experience.soundLead}... ${experience.completion}`,
      );
      assert.equal(experience.fallbackSpeech, experience.spokenCallout);
      assert.equal(
        experience.audioCallout,
        `/audio/${language}/number-callouts/number-${digit}.mp3`,
      );
      const asset = new URL(
        `../public${experience.audioCallout}`,
        import.meta.url,
      );
      assert.equal(existsSync(asset), true, experience.audioCallout);
      assert.ok(statSync(asset).size > 20_000, experience.audioCallout);
    }
    assert.equal(numberCalloutAudioPathsFor(language).length, 10);
  }

  assert.equal(numberExperience(4, "en-US")?.phoneticDisplay, "fuh…or");
  assert.equal(numberExperience(4, "en-US")?.spokenCallout, "fuh... or");
  assert.equal(
    numberExperience(4, "en-US")?.audioCallout,
    "/audio/en-US/number-callouts/number-4.mp3",
  );
  assert.equal(numberExperience(4, "es-419")?.phoneticDisplay, "cua…tro");
});

test("counting hands represent the exact digit with at most five fingers each", () => {
  for (const digit of NUMBER_DIGITS) {
    const experience = numberExperience(digit, "en-US");
    assert.ok(experience);
    assert.equal(
      experience.handCounts.reduce((total, count) => total + count, 0),
      Number(digit),
    );
    assert.ok(experience.handCounts.every((count) => count >= 0 && count <= 5));
    assert.equal(experience.handCounts.length, Number(digit) > 5 ? 2 : 1);
  }
});

test("number experiences resolve only for number cues", () => {
  assert.equal(numberExperienceFromCue("number-9", "9", "en-US")?.digit, "9");
  assert.equal(numberExperienceFromCue("letter-a", "A", "en-US"), undefined);
  assert.equal(numberExperience("10", "en-US"), undefined);
  assert.equal(numberExperience(-1, "es-419"), undefined);
});

test("the number hand uses accessible illustrated assets for every hand count", () => {
  const source = readFileSync(
    new URL("../app/number-hand-doodle.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /role="img"/);
  assert.match(source, /aria-label=\{experience\.handLabel\}/);
  assert.match(source, /<Image\b/);
  assert.match(source, /\/images\/number-hands\/hand-/);
  assert.doesNotMatch(source, /<svg\b/i);

  for (let count = 0; count <= 5; count += 1) {
    const asset = new URL(
      `../public/images/number-hands/hand-${count}.webp`,
      import.meta.url,
    );
    assert.equal(existsSync(asset), true, `missing illustrated hand ${count}`);
    assert.ok(statSync(asset).size > 20_000, `hand ${count} is too small`);
  }
});
