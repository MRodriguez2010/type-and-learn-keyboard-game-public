export type Language = "en-US" | "es-419";
export type CueMode =
  | "name-and-sound"
  | "name-sound-word"
  | "name-only";
export type KeyScope = "letters-and-numbers" | "all-keys";
export type MotionPreference = "gentle" | "still";
export type ThemeId =
  | "space"
  | "sea"
  | "robots"
  | "school"
  | "rainbows"
  | "birthday";

export type ParentSettings = {
  version: 1;
  language: Language;
  cueMode: CueMode;
  keyScope: KeyScope;
  imitationTurnMs: 2000 | 3000 | 5000;
  maxConsecutivePlays: 1 | 2;
  volume: number;
  motion: MotionPreference;
  animationMovementPercent: number;
  theme: ThemeId;
};

export const SETTINGS_STORAGE_KEY = "press-play-settings-v1";
export const ANIMATION_MOVEMENT_MIN = 50;
export const ANIMATION_MOVEMENT_MAX = 250;
export const ANIMATION_MOVEMENT_STEP = 25;

export const DEFAULT_SETTINGS: ParentSettings = Object.freeze({
  version: 1,
  language: "en-US",
  cueMode: "name-and-sound",
  keyScope: "letters-and-numbers",
  imitationTurnMs: 3000,
  maxConsecutivePlays: 2,
  volume: 0.75,
  motion: "gentle",
  animationMovementPercent: 175,
  theme: "school",
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function sanitizeSettings(value: unknown): ParentSettings {
  if (!isRecord(value)) {
    return { ...DEFAULT_SETTINGS };
  }

  const language: Language =
    value.language === "en-US" || value.language === "es-419"
      ? value.language
      : DEFAULT_SETTINGS.language;

  const cueMode: CueMode =
    value.cueMode === "name-and-sound" ||
    value.cueMode === "name-sound-word" ||
    value.cueMode === "name-only"
      ? value.cueMode
      : DEFAULT_SETTINGS.cueMode;

  const keyScope: KeyScope =
    value.keyScope === "letters-and-numbers" || value.keyScope === "all-keys"
      ? value.keyScope
      : DEFAULT_SETTINGS.keyScope;

  const imitationTurnMs: ParentSettings["imitationTurnMs"] =
    value.imitationTurnMs === 2000 ||
    value.imitationTurnMs === 3000 ||
    value.imitationTurnMs === 5000
      ? value.imitationTurnMs
      : DEFAULT_SETTINGS.imitationTurnMs;

  const maxConsecutivePlays: ParentSettings["maxConsecutivePlays"] =
    value.maxConsecutivePlays === 1 || value.maxConsecutivePlays === 2
      ? value.maxConsecutivePlays
      : DEFAULT_SETTINGS.maxConsecutivePlays;

  const volume =
    typeof value.volume === "number" &&
    Number.isFinite(value.volume) &&
    value.volume >= 0 &&
    value.volume <= 1
      ? value.volume
      : DEFAULT_SETTINGS.volume;

  const motion: MotionPreference =
    value.motion === "gentle" || value.motion === "still"
      ? value.motion
      : DEFAULT_SETTINGS.motion;

  const animationMovementPercent =
    typeof value.animationMovementPercent === "number" &&
    Number.isFinite(value.animationMovementPercent)
      ? Math.min(
          ANIMATION_MOVEMENT_MAX,
          Math.max(
            ANIMATION_MOVEMENT_MIN,
            Math.round(
              value.animationMovementPercent / ANIMATION_MOVEMENT_STEP,
            ) * ANIMATION_MOVEMENT_STEP,
          ),
        )
      : DEFAULT_SETTINGS.animationMovementPercent;

  const theme: ThemeId =
    value.theme === "space" ||
    value.theme === "sea" ||
    value.theme === "robots" ||
    value.theme === "school" ||
    value.theme === "rainbows" ||
    value.theme === "birthday"
      ? value.theme
      : DEFAULT_SETTINGS.theme;

  return {
    version: 1,
    language,
    cueMode,
    keyScope,
    imitationTurnMs,
    maxConsecutivePlays,
    volume,
    motion,
    animationMovementPercent,
    theme,
  };
}

export function decodeSettings(raw: string | null): ParentSettings {
  if (!raw) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function encodeSettings(settings: ParentSettings) {
  return JSON.stringify(sanitizeSettings(settings));
}
