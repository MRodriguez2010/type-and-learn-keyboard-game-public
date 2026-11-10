

import {
  LETTER_DEFINITIONS,
  voiceGenerationItems,
} from "../app/lib/cues.ts";
import { letterExamples } from "../app/lib/letter-examples.ts";
import {
  NUMBER_DIGITS,
  numberExperience,
} from "../app/lib/number-experience.ts";
import {
  familiarWordsFor,
  promptForTarget,
  talkAndPointPromptAudioPath,
} from "../app/lib/talk-and-point.ts";


const SPANISH_LETTER_PRONUNCIATIONS = {
  "letter-a": { display: "A", input: "a", ipa: "/a/", avoid: "English /eɪ/" },
  "letter-b": { display: "B", input: "beh", ipa: "/be/", avoid: "English /biː/" },
  "letter-c": { display: "C", input: "cé", ipa: "/se/", avoid: "English /siː/" },
  "letter-d": { display: "D", input: "dé", ipa: "/de/", avoid: "English /diː/" },
  "letter-e": { display: "E", input: "é", ipa: "/e/", avoid: "English /iː/" },
  "letter-f": { display: "F", input: "efe", ipa: "/ˈefe/", avoid: "English /ɛf/" },
  "letter-g": { display: "G", input: "je", ipa: "/xe/", avoid: "English /dʒiː/" },
  "letter-h": { display: "H", input: "hache", ipa: "/ˈatʃe/", avoid: "English /eɪtʃ/" },
  "letter-i": { display: "I", input: "í", ipa: "/i/", avoid: "English /aɪ/" },
  "letter-j": { display: "J", input: "jota", ipa: "/ˈxota/", avoid: "English /dʒeɪ/" },
  "letter-k": { display: "K", input: "ka", ipa: "/ka/", avoid: "English /keɪ/" },
  "letter-l": { display: "L", input: "ele", ipa: "/ˈele/", avoid: "English /ɛl/" },
  "letter-m": { display: "M", input: "eme", ipa: "/ˈeme/", avoid: "English /ɛm/" },
  "letter-n": { display: "N", input: "ene", ipa: "/ˈene/", avoid: "English /ɛn/" },
  "letter-enye": { display: "Ñ", input: "eñe", ipa: "/ˈeɲe/", avoid: "any other letter name" },
  "letter-o": { display: "O", input: "ó", ipa: "/o/", avoid: "English /oʊ/" },
  "letter-p": { display: "P", input: "pé", ipa: "/pe/", avoid: "English /piː/" },
  "letter-q": { display: "Q", input: "cu", ipa: "/ku/", avoid: "English /kjuː/" },
  "letter-r": { display: "R", input: "erre", ipa: "/ˈere/", avoid: "English /ɑɹ/" },
  "letter-s": { display: "S", input: "ese", ipa: "/ˈese/", avoid: "English /ɛs/" },
  "letter-t": { display: "T", input: "té", ipa: "/te/", avoid: "English /tiː/" },
  "letter-u": { display: "U", input: "ú", ipa: "/u/", avoid: "English /juː/" },
  "letter-v": { display: "V", input: "uve", ipa: "/ˈuβe/", avoid: "English /viː/" },
  "letter-w": { display: "W", input: "uve doble", ipa: "/ˈuβe ˈðoβle/", avoid: "English double-u" },
  "letter-x": { display: "X", input: "equis", ipa: "/ˈekis/", avoid: "English /ɛks/" },
  "letter-y": { display: "Y", input: "ye", ipa: "/ʝe/", avoid: "English /waɪ/" },
  "letter-z": { display: "Z", input: "zeta", ipa: "/ˈseta/", avoid: "English /ziː/" },
};

const coreItems = voiceGenerationItems();

function pictureWordGenerationItems() {
  const sourceItems = new Map(
    coreItems.map((item) => [
      `${item.language}:${item.id}:${item.kind}`,
      item,
    ]),
  );
  const callouts = [];

  for (const definition of LETTER_DEFINITIONS) {
    for (const language of ["en-US", "es-419"]) {
      const name = sourceItems.get(`${language}:${definition.id}:name`);
      const vocal = sourceItems.get(`${language}:${definition.id}:vocal`);
      if (!name || !vocal) {
        throw new Error(`Missing source cue for ${language}/${definition.id}`);
      }

      for (const example of letterExamples(
        language,
        definition.display,
      )) {
        const spokenName =
          language === "es-419"
            ? SPANISH_LETTER_PRONUNCIATIONS[definition.id]?.input
            : name.input;
        if (!spokenName) {
          throw new Error(`Missing spoken name for ${language}/${definition.id}`);
        }
        callouts.push({
          id: definition.id,
          language,
          kind: "callout",
          input: `${spokenName}. ${vocal.input}. ${example.spoken}.`,
          output: `public${example.audioCallout}`,
        });
      }
    }
  }

  return callouts;
}

function numberCalloutGenerationItems() {
  return ["en-US", "es-419"].flatMap((language) =>
    NUMBER_DIGITS.map((digit) => {
      const experience = numberExperience(digit, language);
      if (!experience) {
        throw new Error(`Missing number experience for ${language}/${digit}`);
      }

      return {
        id: `number-callout-${language}-${digit}`,
        language,
        kind: "number-callout",
        input: `${experience.spokenCallout}.`,
        output: `public${experience.audioCallout}`,
        targetWord: experience.word,
        phoneticDisplay: experience.phoneticDisplay,
      };
    }),
  );
}

function talkAndPointGenerationItems() {
  return ["en-US", "es-419"].flatMap((language) =>
    familiarWordsFor(language).flatMap((item) => [
      {
        id: `talk-word-${item.id}`,
        language,
        kind: "talk-word",
        input: item.wordSoundSpeech,
        output: `public${item.wordCalloutAudio}`,
        targetWord: item.spoken,
      },
      {
        id: `talk-prompt-${item.id}`,
        language,
        kind: "talk-prompt",
        input: promptForTarget(item),
        output: `public${talkAndPointPromptAudioPath(item)}`,
        targetWord: item.spoken,
      },
    ]),
  );
}

const calloutItems = pictureWordGenerationItems();
const numberCalloutItems = numberCalloutGenerationItems();
const talkAndPointItems = talkAndPointGenerationItems();
const force = process.argv.includes("--force");
const onlyIdArgument = process.argv.find((argument) => argument.startsWith("--only-id="));
const onlyId = onlyIdArgument?.slice("--only-id=".length);
const onlyOutputArgument = process.argv.find((argument) =>
  argument.startsWith("--only-output="),
);
const onlyOutput = onlyOutputArgument?.slice("--only-output=".length);
const selectedItems = process.argv.includes("--spanish-letters-only")
  ? [
      ...coreItems.filter(
        (item) =>
          item.language === "es-419" &&
          item.kind === "name" &&
          item.id.startsWith("letter-"),
      ),
      ...calloutItems.filter((item) => item.language === "es-419"),
    ]
  : process.argv.includes("--callouts-only")
    ? calloutItems
    : process.argv.includes("--number-callouts-only")
      ? numberCalloutItems
      : process.argv.includes("--talk-and-point-only")
        ? talkAndPointItems
        : process.argv.includes("--new-activities-only")
          ? [...numberCalloutItems, ...talkAndPointItems]
          : [
              ...coreItems,
              ...calloutItems,
              ...numberCalloutItems,
              ...talkAndPointItems,
            ];
const items = onlyId
  ? selectedItems.filter((item) => item.id === onlyId)
  : onlyOutput
    ? selectedItems.filter((item) => item.output === onlyOutput)
    : selectedItems;
let generated = 0;
let skipped = 0;

function speechInputFor(item) {
  if (
    item.language === "es-419" &&
    item.kind === "name" &&
    SPANISH_LETTER_PRONUNCIATIONS[item.id]
  ) {
    return SPANISH_LETTER_PRONUNCIATIONS[item.id].input;
  }
  return item.input;
}

const entries = items.map(item => ({path:item.output, language:item.language, text:speechInputFor(item)}));
console.log(JSON.stringify(entries, null, 2));
