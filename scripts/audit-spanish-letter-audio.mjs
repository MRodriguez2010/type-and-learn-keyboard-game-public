import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  LETTER_DEFINITIONS,
  voiceGenerationItems,
} from "../app/lib/cues.ts";
import { letterExamples } from "../app/lib/letter-examples.ts";

const API_URL = "https://api.openai.com/v1/audio/transcriptions";
const CHAT_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini-transcribe";
const AUDIO_MODEL = "gpt-audio-1.5";
const CONCURRENCY = 4;
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required to audit the Spanish voice pack.");
}

const outputArgument = process.argv.indexOf("--output");
const outputPath =
  outputArgument >= 0 && process.argv[outputArgument + 1]
    ? path.resolve(process.argv[outputArgument + 1])
    : null;
const onlyIdArgument = process.argv.find((argument) => argument.startsWith("--only-id="));
const onlyId = onlyIdArgument?.slice("--only-id=".length);

const PRONUNCIATION_CONTRASTS = {
  "letter-a": ["/a/ as in casa", "/eɪ/ as in English hey"],
  "letter-b": ["/be/, with e as in mesa", "/biː/, with i as in mismo"],
  "letter-c": ["/se/, with e as in mesa", "/siː/, with i as in mismo"],
  "letter-d": ["/de/, with e as in mesa", "/diː/, with i as in mismo"],
  "letter-e": ["/e/ as in mesa", "/iː/ as in English see"],
  "letter-f": ["/ˈefe/, two syllables", "/ɛf/, one syllable"],
  "letter-g": ["/xe/, with the jota-like Spanish sound", "/dʒiː/ as in English gee"],
  "letter-h": ["/ˈatʃe/, three syllables", "/eɪtʃ/ as in English aitch"],
  "letter-i": ["/i/ as in mismo", "/aɪ/ as in English eye"],
  "letter-j": ["/ˈxota/, Spanish jota", "/dʒeɪ/ as in English jay"],
  "letter-k": ["/ka/, vowel a as in casa", "/keɪ/ as in English kay"],
  "letter-l": ["/ˈele/, two syllables", "/ɛl/, one syllable"],
  "letter-m": ["/ˈeme/, two syllables", "/ɛm/, one syllable"],
  "letter-n": ["/ˈene/, two syllables", "/ɛn/, one syllable"],
  "letter-enye": ["/ˈeɲe/, Spanish eñe", "any other letter name"],
  "letter-o": ["/o/, a pure Spanish vowel", "/oʊ/, an English diphthong"],
  "letter-p": ["/pe/, with e as in mesa", "/piː/, with i as in mismo"],
  "letter-q": ["/ku/, without a y sound", "/kjuː/, with the English y sound"],
  "letter-r": ["/ˈere/, two syllables", "/ɑɹ/, one English syllable"],
  "letter-s": ["/ˈese/, two syllables", "/ɛs/, one syllable"],
  "letter-t": ["/te/, with e as in mesa", "/tiː/, with i as in mismo"],
  "letter-u": ["/u/, without a y sound", "/juː/, with the English y sound"],
  "letter-v": ["/ˈuβe/, two syllables", "/viː/, one English syllable"],
  "letter-w": ["uve doble in Spanish", "double-u in English"],
  "letter-x": ["/ˈekis/, two syllables", "/ɛks/, one syllable"],
  "letter-y": ["/ʝe/, Spanish ye", "/waɪ/, English why"],
  "letter-z": ["/ˈseta/, two syllables", "/ziː/, English zee"],
};

const spanishCoreItems = voiceGenerationItems().filter(
  (item) => item.language === "es-419" && item.id.startsWith("letter-") && item.kind === "name",
);
const spanishNames = new Map(spanishCoreItems.map((item) => [item.id, item.input]));
const englishNames = new Map(
  voiceGenerationItems()
    .filter(
      (item) =>
        item.language === "en-US" &&
        item.id.startsWith("letter-") &&
        item.kind === "name",
    )
    .map((item) => [item.id, item.input]),
);
const displays = new Map(
  LETTER_DEFINITIONS.map((definition) => [definition.id, definition.display]),
);

const allItems = spanishCoreItems.map((item) => ({
  ...item,
  display: displays.get(item.id),
  englishName: englishNames.get(item.id),
}));
for (const definition of LETTER_DEFINITIONS) {
  const name = spanishNames.get(definition.id);
  if (!name) {
    throw new Error(`Missing Spanish letter name for ${definition.id}`);
  }

  for (const example of letterExamples("es-419", definition.display)) {
    allItems.push({
      id: definition.id,
      language: "es-419",
      kind: "callout",
      input: `${name} ... ${definition.vocalCue?.["es-419"] ?? ""} ... ${example.spoken}.`,
      output: `public${example.audioCallout}`,
      display: definition.display,
      englishName: englishNames.get(definition.id),
    });
  }
}
const items = onlyId
  ? allItems.filter((item) => item.id === onlyId)
  : allItems;

const CONTRAST_PROMPT = [
  "Auditoría de pronunciación infantil en español latinoamericano.",
  "Transcribe literalmente en minúsculas y con palabras completas.",
  "No reemplaces los nombres de letras por sus símbolos.",
  "Distingue cuidadosamente be de bi, ce de si, de de di, ge de yi, pe de pi, te de ti, u de iu, uve de vi, y ye de uai.",
  "Conserva las repeticiones y las palabras ilustradas.",
].join(" ");

async function transcribe(item, bytes) {
  const sourcePath = path.resolve(item.output);
  const form = new FormData();
  form.set("file", new Blob([bytes], { type: "audio/mpeg" }), path.basename(sourcePath));
  form.set("model", MODEL);
  form.set("language", "es");
  form.set("prompt", CONTRAST_PROMPT);
  form.set("response_format", "json");

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Transcription failed (${response.status}): ${detail.slice(0, 300)}`);
      }
      const result = await response.json();
      return {
        id: item.id,
        kind: item.kind,
        file: item.output,
        expected: item.input,
        transcript: String(result.text ?? "").trim(),
      };
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
      }
    }
  }
  throw lastError;
}

async function classifyLetterName(item, bytes) {
  const [spanishPronunciation, englishPronunciation] =
    PRONUNCIATION_CONTRASTS[item.id];
  const prompt = [
    `Listen only to the first spoken letter name in this audio, before the first pause.`,
    `The Latin American Spanish pronunciation of ${item.display} is ${spanishPronunciation}.`,
    `The contrasting American English pronunciation is ${englishPronunciation}.`,
    "Classify the actual pronunciation, not the filename or intended script.",
    "Reply with exactly one lowercase word: correct, english, incorrect, or unclear.",
  ].join(" ");

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AUDIO_MODEL,
          modalities: ["text", "audio"],
          audio: { voice: "alloy", format: "wav" },
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "input_audio",
                  input_audio: {
                    data: bytes.toString("base64"),
                    format: "mp3",
                  },
                },
              ],
            },
          ],
          max_completion_tokens: 80,
          temperature: 0,
        }),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Audio classification failed (${response.status}): ${detail.slice(0, 300)}`);
      }
      const result = await response.json();
      const answer = String(
        result.choices?.[0]?.message?.audio?.transcript ??
          result.choices?.[0]?.message?.content ??
          "",
      ).toLowerCase();
      const verdict = ["incorrect", "correct", "english", "unclear"].find(
        (candidate) => new RegExp(`\\b${candidate}\\b`).test(answer),
      );
      if (!verdict) {
        lastError = new Error(`Unexpected audio classification response`);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
          continue;
        }
        return "unclear";
      }
      return verdict;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
      }
    }
  }
  throw lastError;
}

async function audit(item) {
  const bytes = await readFile(path.resolve(item.output));
  const [transcript, verdict] = await Promise.all([
    transcribe(item, bytes),
    classifyLetterName(item, bytes),
  ]);
  return { ...transcript, verdict };
}

const queue = [...items];
const results = [];
let completed = 0;

async function worker() {
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;
    const result = await audit(item);
    results.push(result);
    completed += 1;
    process.stdout.write(`${completed}/${items.length} ${item.output}\n`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
results.sort((left, right) => left.file.localeCompare(right.file));

const report = {
  generatedAt: new Date().toISOString(),
  model: MODEL,
  audioModel: AUDIO_MODEL,
  locale: "es-419",
  files: results.length,
  letterNames: results.filter((item) => item.kind === "name").length,
  callouts: results.filter((item) => item.kind === "callout").length,
  results,
};

if (outputPath) {
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`Saved audit report to ${outputPath}\n`);
} else {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
