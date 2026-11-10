import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import {
  actionWordFor,
  audioCueForChoice,
  createTwoChoiceRound,
  familiarWordsFor,
  feedbackForChoice,
  nextFamiliarWord,
  nextTwoChoiceRound,
  promptForTarget,
  talkAndPointAudioPathsFor,
  talkAndPointPromptAudioPath,
} from "../app/lib/talk-and-point.ts";

test("familiar word activities reuse reviewed bilingual callouts", () => {
  for (const language of ["en-US", "es-419"]) {
    const deck = familiarWordsFor(language);

    assert.ok(deck.length >= 16);
    assert.equal(new Set(deck.map((item) => item.id)).size, deck.length);

    for (const item of deck) {
      assert.ok(["animal", "object"].includes(item.kind));
      assert.ok(item.word);
      assert.ok(item.spoken);
      assert.ok(item.emoji);
      assert.ok(item.soundCue);
      assert.match(item.wordSoundSpeech, new RegExp(`^${item.spoken}\\.`));
      assert.ok(actionWordFor(item.motion, language));
      assert.match(
        item.wordCalloutAudio,
        new RegExp(`^/audio/${language}/talk-and-point/meet-`),
      );
      assert.notEqual(item.wordCalloutAudio, item.audioCallout);

      const audioFile = new URL(
        `../public${item.wordCalloutAudio}`,
        import.meta.url,
      );
      assert.equal(existsSync(audioFile), true, item.wordCalloutAudio);
      assert.ok(statSync(audioFile).size > 20_000, item.wordCalloutAudio);
    }

    assert.equal(
      talkAndPointAudioPathsFor(language).length,
      deck.length * 2,
    );
  }
});

test("next word selection is deterministic, bounded, and avoids repeats", () => {
  const deck = familiarWordsFor("en-US");
  const first = nextFamiliarWord("en-US", undefined, () => 0);
  const last = nextFamiliarWord("en-US", undefined, () => 1);

  assert.equal(first.id, deck[0].id);
  assert.equal(last.id, deck.at(-1).id);
  assert.notEqual(
    nextFamiliarWord("en-US", first.id, () => 0).id,
    first.id,
  );

  assert.equal(
    nextFamiliarWord("en-US", undefined, () => Number.NaN).id,
    deck[0].id,
  );
  assert.equal(
    nextFamiliarWord("en-US", undefined, () => {
      throw new Error("unavailable entropy");
    }).id,
    deck[0].id,
  );
});

test("two-choice prompts contain one target, one gentle distractor, and no game score", () => {
  for (const language of ["en-US", "es-419"]) {
    const round = nextTwoChoiceRound(language, undefined, () => 0.75);

    assert.equal(round.choices.length, 2);
    assert.equal(new Set(round.choices.map((item) => item.id)).size, 2);
    assert.equal(
      round.choices.filter((item) => item.id === round.target.id).length,
      1,
    );
    assert.equal(round.choices[0].kind, round.choices[1].kind);
    assert.equal("score" in round, false);
    assert.equal("timer" in round, false);
    assert.equal("penalty" in round, false);
    assert.match(
      round.promptAudio,
      new RegExp(`^/audio/${language}/talk-and-point/where-is-`),
    );
    const promptAudio = new URL(
      `../public${round.promptAudio}`,
      import.meta.url,
    );
    assert.equal(existsSync(promptAudio), true, round.promptAudio);
    assert.ok(statSync(promptAudio).size > 20_000, round.promptAudio);
  }
});

test("prompts and feedback are warm and localized", () => {
  const dog = familiarWordsFor("en-US").find((item) => item.word === "Dog");
  const gato = familiarWordsFor("es-419").find((item) => item.word === "Gato");
  assert.ok(dog);
  assert.ok(gato);

  const englishRound = createTwoChoiceRound(dog, () => 0);
  const spanishRound = createTwoChoiceRound(gato, () => 0);

  assert.equal(promptForTarget(dog), "Where’s the dog?");
  assert.equal(promptForTarget(gato), "¿Dónde está el gato?");
  assert.equal(
    talkAndPointPromptAudioPath(dog),
    "/audio/en-US/talk-and-point/where-is-dog.mp3",
  );
  assert.equal(
    talkAndPointPromptAudioPath(gato),
    "/audio/es-419/talk-and-point/where-is-gato.mp3",
  );
  assert.match(feedbackForChoice(englishRound, dog.id).announcement, /found/i);
  assert.match(
    feedbackForChoice(
      englishRound,
      englishRound.choices.find((choice) => choice.id !== dog.id).id,
    ).announcement,
    /look together/i,
  );
  assert.match(
    feedbackForChoice(spanishRound, gato.id).announcement,
    /encontraste/i,
  );

  const englishDistractor = englishRound.choices.find(
    (choice) => choice.id !== dog.id,
  );
  assert.ok(englishDistractor);
  assert.deepEqual(audioCueForChoice(englishRound, englishDistractor.id), {
    path: englishRound.promptAudio,
    fallbackSpeech: englishRound.prompt,
  });
  assert.deepEqual(audioCueForChoice(englishRound, dog.id), {
    path: dog.wordCalloutAudio,
    fallbackSpeech: dog.wordSoundSpeech,
  });
});

test("the activity components expose touch and assistive-technology affordances", () => {
  const source = readFileSync(
    new URL("../app/talk-and-point-activity.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /role="group"/);
  assert.match(source, /role="status"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-atomic="true"/);
  assert.match(source, /aria-disabled=\{/);
  assert.match(source, /type="button"/);
  assert.match(source, /SpeakerHigh/);
  assert.doesNotMatch(source, /aria-hidden="true">\?<\/span>/);
  assert.doesNotMatch(source, /type="file"|upload|camera|getUserMedia/i);
  assert.doesNotMatch(source, /score|timer|penalty/i);
  assert.doesNotMatch(source, /\sdisabled=\{disabled/);
});
