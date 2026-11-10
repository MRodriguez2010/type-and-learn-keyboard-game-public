import type {
  ExampleMotion,
  LetterExample,
} from "./letter-examples.ts";
// The repository's Node strip-types tests require an explicit TypeScript
// extension; the app bundler supports the same source specifier.
// @ts-expect-error TS5097: allowImportingTsExtensions is not project-wide.
import { letterExamples } from "./letter-examples.ts";
import type { Language } from "./settings.ts";

export type FamiliarWordKind = "animal" | "object";

export type FamiliarWord = LetterExample & {
  id: string;
  language: Language;
  letter: string;
  kind: FamiliarWordKind;
  soundCue: string;
  wordSoundSpeech: string;
  wordCalloutAudio: string;
  spanishArticle?: "el" | "la";
};

export type TwoChoiceRound = {
  id: string;
  language: Language;
  target: FamiliarWord;
  choices: readonly [FamiliarWord, FamiliarWord];
  prompt: string;
  promptAudio: string;
};

export type ChoiceFeedback = {
  found: boolean;
  announcement: string;
};

export type ActivityAudioCue = {
  path: string;
  fallbackSpeech: string;
};

export type RandomSource = () => number;

type FamiliarWordSeed = {
  letter: string;
  word: string;
  kind: FamiliarWordKind;
  soundCue: string;
  spanishArticle?: "el" | "la";
};

// A deliberately small, caregiver-reviewed deck of concrete early words.
// Every entry points to an existing bundled callout; this activity never needs
// an upload, a network-generated image, or a runtime voice request.
const FAMILIAR_WORD_SEEDS: Record<Language, readonly FamiliarWordSeed[]> = {
  "en-US": [
    { letter: "D", word: "Dog", kind: "animal", soundCue: "woof, woof" },
    { letter: "C", word: "Cat", kind: "animal", soundCue: "meow, meow" },
    { letter: "A", word: "Apple", kind: "object", soundCue: "crunch, crunch" },
    { letter: "B", word: "Ball", kind: "object", soundCue: "bounce, bounce" },
    { letter: "F", word: "Fish", kind: "animal", soundCue: "swish, swish" },
    { letter: "H", word: "Hat", kind: "object", soundCue: "hat on" },
    { letter: "J", word: "Juice", kind: "object", soundCue: "sip, sip" },
    { letter: "K", word: "Key", kind: "object", soundCue: "click, click" },
    { letter: "L", word: "Lion", kind: "animal", soundCue: "roar, roar" },
    { letter: "M", word: "Moon", kind: "object", soundCue: "night, night" },
    { letter: "O", word: "Owl", kind: "animal", soundCue: "hoo, hoo" },
    { letter: "P", word: "Pizza", kind: "object", soundCue: "yum, yum" },
    { letter: "R", word: "Rabbit", kind: "animal", soundCue: "hop, hop" },
    { letter: "S", word: "Sun", kind: "object", soundCue: "shine, shine" },
    { letter: "T", word: "Train", kind: "object", soundCue: "choo, choo" },
    { letter: "W", word: "Whale", kind: "animal", soundCue: "splash, splash" },
  ],
  "es-419": [
    { letter: "G", word: "Gato", kind: "animal", soundCue: "miau, miau", spanishArticle: "el" },
    { letter: "V", word: "Vaca", kind: "animal", soundCue: "mu, mu", spanishArticle: "la" },
    { letter: "A", word: "Avión", kind: "object", soundCue: "fuuu, fuuu", spanishArticle: "el" },
    { letter: "B", word: "Barco", kind: "object", soundCue: "chap, chap", spanishArticle: "el" },
    { letter: "C", word: "Casa", kind: "object", soundCue: "toc, toc", spanishArticle: "la" },
    { letter: "D", word: "Dado", kind: "object", soundCue: "rueda, rueda", spanishArticle: "el" },
    {
      letter: "E",
      word: "Elefante",
      kind: "animal",
      soundCue: "prrr, prrr",
      spanishArticle: "el",
    },
    { letter: "F", word: "Flor", kind: "object", soundCue: "snif, snif", spanishArticle: "la" },
    { letter: "H", word: "Helado", kind: "object", soundCue: "ñam, ñam", spanishArticle: "el" },
    { letter: "J", word: "Jugo", kind: "object", soundCue: "glu, glu", spanishArticle: "el" },
    { letter: "L", word: "León", kind: "animal", soundCue: "grr, grr", spanishArticle: "el" },
    { letter: "M", word: "Manzana", kind: "object", soundCue: "crac, crac", spanishArticle: "la" },
    { letter: "O", word: "Oso", kind: "animal", soundCue: "grr, grr", spanishArticle: "el" },
    { letter: "P", word: "Pato", kind: "animal", soundCue: "cuac, cuac", spanishArticle: "el" },
    { letter: "R", word: "Rana", kind: "animal", soundCue: "croac, croac", spanishArticle: "la" },
    { letter: "S", word: "Sol", kind: "object", soundCue: "brilla, brilla", spanishArticle: "el" },
    { letter: "T", word: "Tren", kind: "object", soundCue: "chu, chu", spanishArticle: "el" },
  ],
};

const ACTION_WORDS: Record<
  ExampleMotion,
  Record<Language, string>
> = {
  bounce: { "en-US": "bounce", "es-419": "saltar" },
  chomp: { "en-US": "take a bite", "es-419": "dar un mordisco" },
  flap: { "en-US": "flap", "es-419": "aletear" },
  float: { "en-US": "float", "es-419": "flotar" },
  roll: { "en-US": "roll", "es-419": "rodar" },
  sparkle: { "en-US": "shine", "es-419": "brillar" },
  spin: { "en-US": "spin", "es-419": "girar" },
  sway: { "en-US": "sway", "es-419": "balancearse" },
  swim: { "en-US": "swim", "es-419": "nadar" },
  wiggle: { "en-US": "wiggle", "es-419": "menearse" },
  zoom: { "en-US": "zoom", "es-419": "volar" },
};

function normalizeWord(value: string, language: Language) {
  return value.trim().toLocaleLowerCase(language);
}

function audioSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function safeRandomValue(random: RandomSource) {
  let value = 0;

  try {
    value = random();
  } catch {
    return 0;
  }

  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1 - Number.EPSILON);
}

function pickOne<T>(items: readonly T[], random: RandomSource) {
  if (items.length === 0) {
    throw new Error("Cannot choose from an empty familiar-word list");
  }

  return items[Math.floor(safeRandomValue(random) * items.length)];
}

function itemFromSeed(language: Language, seed: FamiliarWordSeed) {
  const expectedWord = normalizeWord(seed.word, language);
  const example = letterExamples(language, seed.letter).find(
    (candidate) => normalizeWord(candidate.word, language) === expectedWord,
  );

  if (!example) {
    throw new Error(
      `Missing familiar-word example for ${language} ${seed.letter} ${seed.word}`,
    );
  }

  return {
    ...example,
    id: `${language}:${seed.letter}:${expectedWord}`,
    language,
    letter: seed.letter,
    kind: seed.kind,
    soundCue: seed.soundCue,
    wordSoundSpeech: `${example.spoken}. ${seed.soundCue}.`,
    wordCalloutAudio: talkAndPointWordAudioPath(language, example.word),
    spanishArticle: seed.spanishArticle,
  } satisfies FamiliarWord;
}

export function familiarWordsFor(language: Language): FamiliarWord[] {
  return FAMILIAR_WORD_SEEDS[language].map((seed) =>
    itemFromSeed(language, seed),
  );
}

export function actionWordFor(
  motion: ExampleMotion,
  language: Language,
) {
  return ACTION_WORDS[motion][language];
}

export function nextFamiliarWord(
  language: Language,
  previousId?: string,
  random: RandomSource = Math.random,
) {
  const deck = familiarWordsFor(language);
  const withoutImmediateRepeat = deck.filter((item) => item.id !== previousId);

  return pickOne(
    withoutImmediateRepeat.length > 0 ? withoutImmediateRepeat : deck,
    random,
  );
}

export function promptForTarget(target: FamiliarWord) {
  const spokenWord = normalizeWord(target.spoken, target.language);

  if (target.language === "es-419") {
    const article = target.spanishArticle ? `${target.spanishArticle} ` : "";
    return `¿Dónde está ${article}${spokenWord}?`;
  }

  return `Where’s the ${spokenWord}?`;
}

export function talkAndPointPromptAudioPath(target: FamiliarWord) {
  return `/audio/${target.language}/talk-and-point/where-is-${audioSlug(target.word)}.mp3`;
}

export function talkAndPointWordAudioPath(language: Language, word: string) {
  return `/audio/${language}/talk-and-point/meet-${audioSlug(word)}.mp3`;
}

export function talkAndPointAudioPathsFor(language: Language) {
  return familiarWordsFor(language).flatMap((item) => [
    item.wordCalloutAudio,
    talkAndPointPromptAudioPath(item),
  ]);
}

export function createTwoChoiceRound(
  target: FamiliarWord,
  random: RandomSource = Math.random,
): TwoChoiceRound {
  const deck = familiarWordsFor(target.language);
  const allDistractors = deck.filter(
    (candidate) =>
      candidate.id !== target.id && candidate.emoji !== target.emoji,
  );
  const matchingKind = allDistractors.filter(
    (candidate) => candidate.kind === target.kind,
  );
  const distractor = pickOne(
    matchingKind.length > 0 ? matchingKind : allDistractors,
    random,
  );
  const targetFirst = safeRandomValue(random) < 0.5;
  const choices = targetFirst
    ? ([target, distractor] as const)
    : ([distractor, target] as const);

  return {
    id: `${target.id}:${distractor.id}:${targetFirst ? "first" : "second"}`,
    language: target.language,
    target,
    choices,
    prompt: promptForTarget(target),
    promptAudio: talkAndPointPromptAudioPath(target),
  };
}

export function nextTwoChoiceRound(
  language: Language,
  previousTargetId?: string,
  random: RandomSource = Math.random,
) {
  return createTwoChoiceRound(
    nextFamiliarWord(language, previousTargetId, random),
    random,
  );
}

export function feedbackForChoice(
  round: TwoChoiceRound,
  chosenId: string,
): ChoiceFeedback {
  const found = chosenId === round.target.id;
  const spokenWord = normalizeWord(round.target.spoken, round.language);

  if (round.language === "es-419") {
    return found
      ? {
          found: true,
          announcement: `¡Encontraste ${spokenWord}! Díganlo juntos: ${spokenWord}.`,
        }
      : {
          found: false,
          announcement: `Miremos juntos. ${round.prompt}`,
        };
  }

  return found
    ? {
        found: true,
        announcement: `You found the ${spokenWord}! Say it together: ${spokenWord}.`,
      }
    : {
        found: false,
        announcement: `Let’s look together. ${round.prompt}`,
      };
}

export function audioCueForChoice(
  round: TwoChoiceRound,
  chosenId: string,
): ActivityAudioCue {
  if (chosenId === round.target.id) {
    return {
      path: round.target.wordCalloutAudio,
      fallbackSpeech: round.target.wordSoundSpeech,
    };
  }

  return {
    path: round.promptAudio,
    fallbackSpeech: round.prompt,
  };
}
