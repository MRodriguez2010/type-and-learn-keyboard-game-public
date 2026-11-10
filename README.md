# Type & Learn Keyboard Game

An English and Spanish keyboard game. The public voice pack is synthesized offline from the game’s letter names, picture words, and counting prompts.

A calm bilingual learning game for young children and their guardians. Physical
keys or large touchscreen choices trigger short letter, number, picture, voice,
and turn-taking activities without scores, timers, ads, or accounts.

## Play modes

- **Letters & numbers** — press a physical key or use touch-first sound bubbles.
- **Talk & Point** — explore familiar bilingual words, pictures, and actions.
- **Find It** — choose between two gentle picture prompts with no score or timer.

Parent settings cover English/Spanish, cue style, active key scope, pace, volume,
repetition, motion, movement intensity, and six visual themes. Settings remain on
the current device. The game includes guardian exit controls and guidance for
Guided Access or app pinning.

## Run locally

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

## Validate

```bash
npm test
npm run lint
git diff --check
```

Additional audio checks and generation helpers are available through the
`voice:*` package scripts. Review `design-qa.md` for responsive, interaction,
accessibility-name, counting-hand, and visual-comparison evidence.

## Child privacy boundary

The current build has no account, analytics, advertising, child profile,
recording, microphone capture, live AI, score history, or response database.
Do not add those surfaces without a dedicated child-safety/privacy review and
guardian-facing disclosure.

Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for architecture, verified status,
commercial/public readiness, deployment policy, and cold-resume steps.

## Rebuild the public voice pack

Install eSpeak NG and FFmpeg, then run `python3 scripts/render-review-audio.py` from the repository root. The renderer obtains the English and Spanish cue text from `node --experimental-strip-types scripts/generate-voice-pack.mjs` and synthesizes all 477 files locally.
