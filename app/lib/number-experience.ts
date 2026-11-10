import type { Language } from "./settings.ts";

export const NUMBER_DIGITS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
] as const;

export type NumberDigit = (typeof NUMBER_DIGITS)[number];

type NumberPronunciation = {
  word: string;
  soundLead: string;
  completion: string;
};

export type NumberExperience = NumberPronunciation & {
  digit: NumberDigit;
  language: Language;
  /** Child-facing sound blend, such as “fuh…or”. */
  phoneticDisplay: string;
  /** Plain-text version suitable for a recorded or synthesized callout. */
  spokenCallout: string;
  /** Deterministic path for a bundled studio recording. */
  audioCallout: string;
  /** Device-speech fallback when the bundled recording cannot play. */
  fallbackSpeech: string;
  /** Raised fingers on each illustrated hand; 6–9 use five plus the remainder. */
  handCounts: readonly number[];
  handLabel: string;
};

const PRONUNCIATIONS: Record<
  Language,
  Record<NumberDigit, NumberPronunciation>
> = {
  "en-US": {
    "0": { word: "zero", soundLead: "zee", completion: "ro" },
    "1": { word: "one", soundLead: "wuh", completion: "un" },
    "2": { word: "two", soundLead: "tuh", completion: "oo" },
    "3": { word: "three", soundLead: "thuh", completion: "ree" },
    "4": { word: "four", soundLead: "fuh", completion: "or" },
    "5": { word: "five", soundLead: "fuh", completion: "ive" },
    "6": { word: "six", soundLead: "sss", completion: "ix" },
    "7": { word: "seven", soundLead: "seh", completion: "ven" },
    "8": { word: "eight", soundLead: "ay", completion: "tuh" },
    "9": { word: "nine", soundLead: "nnn", completion: "ine" },
  },
  "es-419": {
    "0": { word: "cero", soundLead: "se", completion: "ro" },
    "1": { word: "uno", soundLead: "u", completion: "no" },
    "2": { word: "dos", soundLead: "d", completion: "os" },
    "3": { word: "tres", soundLead: "trr", completion: "es" },
    "4": { word: "cuatro", soundLead: "cua", completion: "tro" },
    "5": { word: "cinco", soundLead: "cin", completion: "co" },
    "6": { word: "seis", soundLead: "s", completion: "eis" },
    "7": { word: "siete", soundLead: "sie", completion: "te" },
    "8": { word: "ocho", soundLead: "o", completion: "cho" },
    "9": { word: "nueve", soundLead: "nue", completion: "ve" },
  },
};

function isNumberDigit(value: string): value is NumberDigit {
  return NUMBER_DIGITS.some((digit) => digit === value);
}

function handCountsFor(digit: NumberDigit): readonly number[] {
  const count = Number(digit);
  return count <= 5 ? [count] : [5, count - 5];
}

function handLabelFor(
  digit: NumberDigit,
  language: Language,
  handCounts: readonly number[],
) {
  const count = Number(digit);

  if (language === "es-419") {
    if (count === 0) return "Una mano cerrada para cero.";
    if (count === 1) return "Un dedo levantado.";
    if (handCounts.length === 1) return `${count} dedos levantados.`;
    const remainder = handCounts[1];
    return `Dos manos: cinco dedos y ${remainder === 1 ? "un dedo" : `${remainder} dedos`} levantados.`;
  }

  if (count === 0) return "A closed hand for zero.";
  if (count === 1) return "One finger raised.";
  if (handCounts.length === 1) return `${count} fingers raised.`;
  const remainder = handCounts[1];
  return `Two hands: five fingers and ${remainder === 1 ? "one finger" : `${remainder} fingers`} raised.`;
}

export function numberExperience(
  value: string | number,
  language: Language,
): NumberExperience | undefined {
  const digit = String(value);
  if (!isNumberDigit(digit)) return undefined;

  const pronunciation = PRONUNCIATIONS[language][digit];
  const handCounts = handCountsFor(digit);
  const spokenCallout = `${pronunciation.soundLead}... ${pronunciation.completion}`;

  return {
    digit,
    language,
    ...pronunciation,
    phoneticDisplay: `${pronunciation.soundLead}…${pronunciation.completion}`,
    spokenCallout,
    audioCallout: `/audio/${language}/number-callouts/number-${digit}.mp3`,
    fallbackSpeech: spokenCallout,
    handCounts,
    handLabel: handLabelFor(digit, language, handCounts),
  };
}

export function numberExperienceFromCue(
  cueId: string,
  display: string,
  language: Language,
) {
  const idDigit = cueId.startsWith("number-") ? cueId.slice(7) : "";
  return numberExperience(idDigit || display, language);
}

export function numberCalloutAudioPathsFor(language: Language) {
  return NUMBER_DIGITS.map(
    (digit) => numberExperience(digit, language)?.audioCallout,
  ).filter((path): path is string => Boolean(path));
}
