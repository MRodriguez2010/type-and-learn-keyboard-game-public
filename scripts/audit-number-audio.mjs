import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  NUMBER_DIGITS,
  numberExperience,
} from "../app/lib/number-experience.ts";

const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-audio-1.5";
const CONCURRENCY = 4;
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required to audit number callouts.");
}

const items = ["en-US", "es-419"].flatMap((language) =>
  NUMBER_DIGITS.map((digit) => numberExperience(digit, language)),
).filter(Boolean);

async function classify(item) {
  const sourcePath = path.resolve(`public${item.audioCallout}`);
  const bytes = await readFile(sourcePath);
  const languageName =
    item.language === "es-419"
      ? "neutral Latin American Spanish"
      : "natural American English";
  const prompt = [
    "Audit this complete child-directed number recording by listening to the actual audio.",
    `It must clearly communicate the number ${item.word} in ${languageName}.`,
    `It should split and blend the word playfully as ${item.phoneticDisplay}, with a brief pause between the two chunks.`,
    "The chunks may be non-dictionary vocal sounds, so judge the audio rather than automatic spelling.",
    "It must not switch languages, name a different number, omit a chunk, or become silent.",
    "Reply with exactly one lowercase word: correct, incorrect, or unclear.",
  ].join(" ");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
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
    throw new Error(
      `Audio classification failed (${response.status}): ${detail.slice(0, 300)}`,
    );
  }

  const result = await response.json();
  const answer = String(
    result.choices?.[0]?.message?.audio?.transcript ??
      result.choices?.[0]?.message?.content ??
      "",
  ).toLowerCase();
  const verdict = ["incorrect", "correct", "unclear"].find((candidate) =>
    new RegExp(`\\b${candidate}\\b`).test(answer),
  );

  return {
    language: item.language,
    digit: item.digit,
    expected: item.phoneticDisplay,
    verdict: verdict ?? "unclear",
  };
}

async function worker(queue, results) {
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) return;
    results.push(await classify(item));
  }
}

const queue = [...items];
const results = [];
await Promise.all(
  Array.from({ length: CONCURRENCY }, () => worker(queue, results)),
);

results.sort(
  (left, right) =>
    left.language.localeCompare(right.language) ||
    Number(left.digit) - Number(right.digit),
);

for (const result of results) {
  process.stdout.write(
    `${result.language} ${result.digit} ${result.expected}: ${result.verdict}\n`,
  );
}

const failures = results.filter((result) => result.verdict !== "correct");
if (failures.length > 0) {
  throw new Error(`${failures.length} number callout audit(s) need review.`);
}
