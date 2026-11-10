import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { describeKey } from "../app/lib/cues.ts";
import {
  acceptCue,
  clearQueue,
  completeCurrent,
  createQueueState,
} from "../app/lib/game-queue.ts";
import {
  decodeSettings,
  DEFAULT_SETTINGS,
  encodeSettings,
  sanitizeSettings,
} from "../app/lib/settings.ts";
import {
  EXAMPLE_MOTIONS,
  letterExamples,
  pictureWordAudioPathsFor,
} from "../app/lib/letter-examples.ts";
import {
  placementFor,
  PLACEMENT_BOUNDS,
} from "../app/lib/placement.ts";
import { THEME_IDS, THEMES } from "../app/lib/themes.ts";
import { shouldUseOnScreenKeyboard } from "../app/lib/touch-device.ts";
import {
  TOUCH_GARDEN_MAX_CHOICES,
  touchGardenPages,
  touchKeysFor,
} from "../app/lib/touch-garden.ts";
import { advanceUnlock } from "../app/lib/unlock.ts";

const cue = (identity) => ({ identity });

test("settings use defaults for missing or malformed storage", () => {
  assert.deepEqual(decodeSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(decodeSettings("{not-json"), DEFAULT_SETTINGS);
});

test("settings validate each field independently", () => {
  assert.deepEqual(
    sanitizeSettings({
      version: 99,
      language: "es-419",
      cueMode: "invalid",
      imitationTurnMs: 5000,
      maxConsecutivePlays: 9,
      volume: 0,
      motion: "still",
    }),
    {
      version: 1,
      language: "es-419",
      cueMode: DEFAULT_SETTINGS.cueMode,
      keyScope: DEFAULT_SETTINGS.keyScope,
      imitationTurnMs: 5000,
      maxConsecutivePlays: DEFAULT_SETTINGS.maxConsecutivePlays,
      volume: 0,
      motion: "still",
      animationMovementPercent:
        DEFAULT_SETTINGS.animationMovementPercent,
      theme: DEFAULT_SETTINGS.theme,
    },
  );

  assert.equal(sanitizeSettings({ volume: 1 }).volume, 1);
  assert.equal(
    sanitizeSettings({ volume: Number.NaN }).volume,
    DEFAULT_SETTINGS.volume,
  );
  assert.equal(sanitizeSettings({ volume: 1.1 }).volume, DEFAULT_SETTINGS.volume);
  assert.equal(sanitizeSettings({ theme: "sea" }).theme, "sea");
  assert.equal(
    sanitizeSettings({ keyScope: "all-keys" }).keyScope,
    "all-keys",
  );
  assert.equal(
    sanitizeSettings({ cueMode: "name-sound-word" }).cueMode,
    "name-sound-word",
  );
  assert.equal(
    sanitizeSettings({ theme: "unknown" }).theme,
    DEFAULT_SETTINGS.theme,
  );
});

test("letters and numbers are the default physical-key scope", () => {
  assert.equal(DEFAULT_SETTINGS.keyScope, "letters-and-numbers");
});

test("the on-screen keyboard is limited to touch-first mobile and tablet devices", () => {
  const touchWindowsLaptop = {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
    maxTouchPoints: 10,
    mobileHint: false,
    coarsePointer: false,
  };
  const touchChromebook = {
    userAgent:
      "Mozilla/5.0 (X11; CrOS x86_64 16000.0.0) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
    maxTouchPoints: 10,
    mobileHint: false,
    coarsePointer: false,
  };
  const windowsTabletMode = {
    ...touchWindowsLaptop,
    coarsePointer: true,
  };
  const iphone = {
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    maxTouchPoints: 5,
  };
  const ipadDesktopMode = {
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/19.0 Safari/605.1.15",
    maxTouchPoints: 5,
  };
  const androidTablet = {
    userAgent:
      "Mozilla/5.0 (Linux; Android 16; Tablet) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
    maxTouchPoints: 5,
  };

  assert.equal(shouldUseOnScreenKeyboard(touchWindowsLaptop), false);
  assert.equal(shouldUseOnScreenKeyboard(touchChromebook), false);
  assert.equal(shouldUseOnScreenKeyboard(windowsTabletMode), true);
  assert.equal(shouldUseOnScreenKeyboard(iphone), true);
  assert.equal(shouldUseOnScreenKeyboard(ipadDesktopMode), true);
  assert.equal(shouldUseOnScreenKeyboard(androidTablet), true);
});

test("every letter has three alternating bundled picture-word callouts", () => {
  const libraries = [
    ["en-US", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
    ["es-419", "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"],
  ];
  const calloutPaths = new Set();

  for (const [language, alphabet] of libraries) {
    const words = new Set();

    for (const letter of alphabet) {
      const examples = letterExamples(language, letter);
      assert.equal(examples.length, 3, `${language} ${letter}`);

      for (const example of examples) {
        const firstCharacter = Array.from(example.word.trim())[0]
          .toLocaleUpperCase();
        const firstLetter =
          letter === "Ñ"
            ? firstCharacter
            : firstCharacter
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "");
        assert.equal(
          firstLetter,
          letter,
          `${example.word} must start with ${letter}`,
        );
        assert.ok(example.spoken);
        assert.ok(example.emoji);
        assert.ok(EXAMPLE_MOTIONS.includes(example.motion));
        assert.match(
          example.audioCallout,
          new RegExp(`^/audio/${language}/callouts/letter-`),
        );
        assert.equal(calloutPaths.has(example.audioCallout), false);
        calloutPaths.add(example.audioCallout);
        const asset = new URL(`../public${example.audioCallout}`, import.meta.url);
        assert.equal(existsSync(asset), true, example.audioCallout);
        assert.ok(statSync(asset).size > 20_000, example.audioCallout);
        assert.equal(words.has(example.word.toLocaleLowerCase()), false);
        words.add(example.word.toLocaleLowerCase());
      }
    }
  }

  assert.equal(calloutPaths.size, 159);
  assert.equal(
    letterExamples("en-US", "D")[0].audioCallout,
    "/audio/en-US/callouts/letter-d-dog.mp3",
  );

  const manifest = JSON.parse(
    readFileSync(
      new URL("../public/audio/manifest.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(manifest.version, 3);
  assert.equal(manifest.files, 477);
  assert.equal(manifest.callouts, 159);
  assert.equal(manifest.numberCallouts, 20);
  assert.equal(manifest.talkAndPointClips, 66);
  assert.equal(pictureWordAudioPathsFor("en-US").length, 78);
  assert.equal(pictureWordAudioPathsFor("es-419").length, 81);
});

test("touch letter garden keeps every choice in balanced groups of six or fewer", () => {
  for (const language of ["en-US", "es-419"]) {
    const expected = touchKeysFor(language);
    const pages = touchGardenPages(language);
    const flattened = pages.flat();

    assert.deepEqual(flattened, expected);
    assert.equal(new Set(flattened).size, expected.length);
    assert.ok(pages.every((page) => page.length <= TOUCH_GARDEN_MAX_CHOICES));
    assert.ok(pages.every((page) => page.length >= 5));
    assert.deepEqual(pages[0], ["A", "B", "C", "D", "E", "F"]);
  }
});

test("picture-word play ships without a runtime generator or database", () => {
  const page = readFileSync(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const hosting = JSON.parse(
    readFileSync(
      new URL("../.openai/hosting.json", import.meta.url),
      "utf8",
    ),
  );
  const schema = readFileSync(
    new URL("../db/schema.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(page, /OPENAI|\/api\/letter-examples/);
  assert.match(page, /example\.audioCallout/);
  assert.match(
    page,
    /const picturePaths = pictureWordAudioPathsFor\(activeLanguage\);/,
  );
  assert.match(
    page,
    /activeCueMode === "name-sound-word" \? \[picturePaths\[0\]\]/,
  );
  assert.match(page, /touch-letter-garden/);
  assert.match(page, /FamiliarWordActivity/);
  assert.match(page, /TwoChoicePrompt/);
  assert.match(page, /NumberHandDoodle/);
  assert.doesNotMatch(page, /touch-keyboard/);
  assert.doesNotMatch(page, /type="file"|getUserMedia/);
  assert.equal(hosting.d1, null);
  assert.match(schema, /Intentionally empty/);
  assert.equal(
    existsSync(
      new URL("../app/api/letter-examples/route.ts", import.meta.url),
    ),
    false,
  );
  assert.equal(
    existsSync(new URL("../db/index.ts", import.meta.url)),
    false,
  );
});

test("settings and every game exit return to the home activity picker", () => {
  const page = readFileSync(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const styles = readFileSync(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(
    page,
    /const exitGame = useCallback[\s\S]*?modeRef\.current = "home";[\s\S]*?setMode\("home"\);/,
  );
  assert.match(
    page,
    /const closeSettingsToHome[\s\S]*?cancelSound\(\);[\s\S]*?setMode\("home"\);/,
  );
  assert.match(page, /data-testid="save-and-close"/);
  assert.doesNotMatch(page, /const saveAndPlay|data-testid="save-and-play"/);
  assert.match(page, /GearSix/);
  assert.match(page, /aria-label=\{homeCopy\.parentSettings\}/);
  assert.match(
    page,
    /event\.key === "Tab" && hasInteractiveGameControls[\s\S]*?controls\[nextIndex\]\?\.focus\(\)/,
  );
  assert.match(
    page,
    /fullscreenWasActiveRef\.current &&\s*!document\.fullscreenElement[\s\S]*?event\.key === "Tab" && hasInteractiveGameControls/,
  );
  assert.match(
    page,
    /hasTouchControls === true \?[\s\S]*?data-testid="touch-exit-help"[\s\S]*?: hasTouchControls === false \?[\s\S]*?data-testid="keyboard-exit-help"/,
  );
  assert.doesNotMatch(styles, /desktop-exit-note|touch-exit-note/);
});

test("settings sanitize and preserve doodle movement intensity", () => {
  assert.equal(DEFAULT_SETTINGS.animationMovementPercent, 175);
  assert.equal(
    sanitizeSettings({ animationMovementPercent: 50 })
      .animationMovementPercent,
    50,
  );
  assert.equal(
    sanitizeSettings({ animationMovementPercent: 225 })
      .animationMovementPercent,
    225,
  );
  assert.equal(
    sanitizeSettings({ animationMovementPercent: 250 })
      .animationMovementPercent,
    250,
  );
  assert.equal(
    sanitizeSettings({ animationMovementPercent: 49 })
      .animationMovementPercent,
    50,
  );
  assert.equal(
    sanitizeSettings({ animationMovementPercent: 251 })
      .animationMovementPercent,
    250,
  );
  assert.equal(
    sanitizeSettings({ animationMovementPercent: 237 })
      .animationMovementPercent,
    225,
  );
  assert.equal(
    sanitizeSettings({ animationMovementPercent: Number.NaN })
      .animationMovementPercent,
    DEFAULT_SETTINGS.animationMovementPercent,
  );
  assert.equal(
    sanitizeSettings({ animationMovementPercent: "175" })
      .animationMovementPercent,
    DEFAULT_SETTINGS.animationMovementPercent,
  );
});

test("settings encode and decode round-trip", () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    language: "es-419",
    cueMode: "name-only",
    imitationTurnMs: 2000,
    maxConsecutivePlays: 1,
    volume: 0.35,
    motion: "still",
    animationMovementPercent: 225,
    theme: "rainbows",
  };
  assert.deepEqual(decodeSettings(encodeSettings(settings)), settings);
});

test("all six gentle themes have complete cue palettes", () => {
  assert.deepEqual(THEME_IDS, [
    "space",
    "sea",
    "robots",
    "school",
    "rainbows",
    "birthday",
  ]);

  for (const themeId of THEME_IDS) {
    assert.deepEqual(Object.keys(THEMES[themeId].colors).sort(), [
      "butter",
      "coral",
      "ivory",
      "sage",
      "sky",
    ]);
  }
});

test("each theme ships a public-ready transparent doodle sprite", () => {
  for (const themeId of THEME_IDS) {
    const sprite = readFileSync(
      new URL(`../public/doodles/${themeId}-sprite.png`, import.meta.url),
    );

    assert.equal(sprite.subarray(1, 4).toString("ascii"), "PNG");
    assert.equal(sprite.readUInt32BE(16), 1600);
    assert.equal(sprite.readUInt32BE(20), 1200);
    assert.ok(
      sprite[25] === 4 || sprite[25] === 6,
      `${themeId} sprite must include an alpha channel`,
    );
    assert.ok(
      sprite.length < 2_000_000,
      `${themeId} sprite should stay below 2 MB`,
    );
  }
});

test("look settings keep the public scenery accessibility contract", () => {
  const page = readFileSync(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const css = readFileSync(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(page, /start: "Play"/);
  assert.match(page, /parentSettings: "Settings"/);
  assert.doesNotMatch(page, /palette-preview/);
  assert.match(css, /animation: none !important;/);
  assert.match(
    css,
    /@media \(max-width: 700px\)[\s\S]*width: min\(var\(--doodle-size\), 32px\)/,
  );
  assert.match(
    css,
    /@media \(max-width: 420px\)[\s\S]*width: min\(var\(--doodle-size\), 28px\)/,
  );
  assert.doesNotMatch(
    css,
    /\.scenery-band \.scenery-motif:nth-child[\s\S]*display: none/,
  );
});

test("queue starts immediately and caps a repeated active key", () => {
  let state = createQueueState();
  state = acceptCue(state, cue("A"), 2);
  state = acceptCue(state, cue("A"), 2);
  state = acceptCue(state, cue("A"), 2);

  assert.equal(state.current.value.identity, "A");
  assert.equal(state.current.playsRemaining, 2);
  assert.equal(state.pending, null);
});

test("queue can limit a repeated active key to one play", () => {
  let state = createQueueState();
  state = acceptCue(state, cue("A"), 1);
  const unchanged = acceptCue(state, cue("A"), 1);
  assert.equal(unchanged, state);
  assert.equal(state.current.playsRemaining, 1);
});

test("A repeated many times plays twice before the newest B", () => {
  let state = createQueueState();
  for (const identity of ["A", "A", "A", "A", "B"]) {
    state = acceptCue(state, cue(identity), 2);
  }

  let completion = completeCurrent(state);
  assert.equal(completion.next.identity, "A");
  assert.equal(completion.state.pending.value.identity, "B");

  completion = completeCurrent(completion.state);
  assert.equal(completion.next.identity, "B");

  completion = completeCurrent(completion.state);
  assert.equal(completion.next, null);
  assert.equal(completion.state.current, null);
});

test("rapid distinct keys retain only the newest pending key", () => {
  let state = createQueueState();
  for (const identity of ["A", "B", "C", "D"]) {
    state = acceptCue(state, cue(identity), 2);
  }

  assert.equal(state.current.value.identity, "A");
  assert.equal(state.pending.value.identity, "D");
  assert.equal(state.pending.playsRemaining, 1);
});

test("pending repeats cap at two and a later key replaces the whole run", () => {
  let state = acceptCue(createQueueState(), cue("A"), 2);
  for (let index = 0; index < 5; index += 1) {
    state = acceptCue(state, cue("B"), 2);
  }
  assert.equal(state.pending.value.identity, "B");
  assert.equal(state.pending.playsRemaining, 2);

  state = acceptCue(state, cue("C"), 2);
  assert.equal(state.pending.value.identity, "C");
  assert.equal(state.pending.playsRemaining, 1);
});

test("an allowed repeat of the active key replaces an older pending key", () => {
  let state = acceptCue(createQueueState(), cue("A"), 2);
  state = acceptCue(state, cue("B"), 2);
  state = acceptCue(state, cue("A"), 2);

  assert.equal(state.current.value.identity, "A");
  assert.equal(state.current.playsRemaining, 2);
  assert.equal(state.pending, null);
});

test("clearing the queue also resets duplicate tracking", () => {
  let state = acceptCue(createQueueState(), cue("A"), 2);
  state = acceptCue(state, cue("A"), 2);
  assert.notDeepEqual(state, createQueueState());
  assert.deepEqual(clearQueue(), createQueueState());
});

test("PARENT unlock is contiguous and case-insensitive", () => {
  let buffer = "";
  for (const key of ["p", "A", "r", "E", "n", "T"]) {
    const progress = advanceUnlock(buffer, key);
    buffer = progress.buffer;
    if (key !== "T") assert.equal(progress.unlocked, false);
    else assert.equal(progress.unlocked, true);
  }
});

test("unlock resets on interruptions and 12345 remains ordinary input", () => {
  let buffer = "";
  for (const key of ["1", "2", "3", "4", "5", "P", "A", "X", "R", "E"]) {
    const progress = advanceUnlock(buffer, key);
    buffer = progress.buffer;
    assert.equal(progress.unlocked, false);
  }

  buffer = "";
  let unlocked = false;
  for (const key of "PPARENT") {
    const progress = advanceUnlock(buffer, key);
    buffer = progress.buffer;
    unlocked = progress.unlocked;
  }
  assert.equal(unlocked, true);
});

test("cue mapping is bilingual and deterministic", () => {
  const englishM = describeKey("m", "en-US");
  const spanishM = describeKey("m", "es-419");
  const enye = describeKey("ñ", "es-419");
  const number = describeKey("3", "es-419");
  const special = describeKey("Enter", "es-419");

  assert.equal(englishM.display, "M");
  assert.equal(englishM.spoken, "M");
  assert.equal(englishM.vocal, "mmm");
  assert.equal(spanishM.spoken, "eme");
  assert.equal(enye.display, "Ñ");
  assert.equal(enye.spoken, "eñe");
  assert.equal(number.spoken, "tres");
  assert.equal(special.display, "INTRO");
  assert.equal(special.spoken, "intro");
  assert.equal(
    describeKey("m", "en-US").colorSlot,
    describeKey("m", "en-US").colorSlot,
  );
});

test("unknown keys receive a readable fallback", () => {
  const unknown = describeKey("F13", "en-US");
  assert.equal(unknown.display, "F13");
  assert.equal(unknown.audioName, undefined);
  assert.equal(unknown.isWord, true);
});

test("character placements are deterministic, varied, and bounded", () => {
  const first = placementFor(0, "letter-a", false);
  const repeated = placementFor(0, "letter-a", false);
  const next = placementFor(1, "letter-a", false);

  assert.deepEqual(first, repeated);
  assert.notDeepEqual(first, next);

  for (let renderId = 0; renderId < 500; renderId += 1) {
    const placement = placementFor(renderId, `letter-${renderId % 26}`, false);
    assert.ok(Math.abs(placement.xVw) <= PLACEMENT_BOUNDS.character.xVw);
    assert.ok(Math.abs(placement.yVh) <= PLACEMENT_BOUNDS.character.yVh);
  }
});

test("word placements use tighter horizontal bounds", () => {
  for (let renderId = 0; renderId < 500; renderId += 1) {
    const placement = placementFor(renderId, `key-${renderId}`, true);
    assert.ok(Math.abs(placement.xVw) <= PLACEMENT_BOUNDS.word.xVw);
    assert.ok(Math.abs(placement.yVh) <= PLACEMENT_BOUNDS.word.yVh);
  }
});
