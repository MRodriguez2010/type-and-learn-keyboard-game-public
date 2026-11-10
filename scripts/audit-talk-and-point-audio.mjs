import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  familiarWordsFor,
  promptForTarget,
  talkAndPointPromptAudioPath,
} from "../app/lib/talk-and-point.ts";

const API_URL = "https://api.openai.com/v1/audio/transcriptions";
const MODEL = "gpt-4o-mini-transcribe";
const CONCURRENCY = 4;
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required to audit Talk & Point audio.");
}

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

const items = ["en-US", "es-419"].flatMap((language) =>
  familiarWordsFor(language).flatMap((item) => [
    {
      language,
      kind: "word",
      target: item.spoken,
      expected: item.wordSoundSpeech,
      output: `public${item.wordCalloutAudio}`,
    },
    {
      language,
      kind: "prompt",
      target: item.spoken,
      expected: promptForTarget(item),
      output: `public${talkAndPointPromptAudioPath(item)}`,
    },
  ]),
);

async function transcribe(item) {
  const sourcePath = path.resolve(item.output);
  const bytes = await readFile(sourcePath);
  const form = new FormData();
  form.set(
    "file",
    new Blob([bytes], { type: "audio/mpeg" }),
    path.basename(sourcePath),
  );
  form.set("model", MODEL);
  form.set("language", item.language === "es-419" ? "es" : "en");
  form.set("prompt", item.expected);
  form.set("response_format", "json");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Transcription failed (${response.status}): ${detail.slice(0, 300)}`,
    );
  }

  const result = await response.json();
  const transcript = String(result.text ?? "").trim();
  const normalizedTranscript = normalize(transcript);
  const normalizedTarget = normalize(item.target);
  const targetPresent = normalizedTranscript.includes(normalizedTarget);
  const questionPresent =
    item.kind !== "prompt" ||
    (item.language === "es-419"
      ? normalizedTranscript.includes("donde esta")
      : normalizedTranscript.includes("where s the") ||
        normalizedTranscript.includes("where is the"));

  return {
    ...item,
    transcript,
    passed: targetPresent && questionPresent,
  };
}

async function worker(queue, results) {
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) return;
    results.push(await transcribe(item));
  }
}

const queue = [...items];
const results = [];
await Promise.all(
  Array.from({ length: CONCURRENCY }, () => worker(queue, results)),
);

const failures = results.filter((result) => !result.passed);
for (const failure of failures) {
  process.stdout.write(
    `${failure.language} ${failure.kind} ${failure.target}: ${failure.transcript}\n`,
  );
}
process.stdout.write(
  `Talk & Point audit: ${results.length - failures.length}/${results.length} clips passed.\n`,
);

if (failures.length > 0) {
  throw new Error(`${failures.length} Talk & Point clip(s) need review.`);
}
