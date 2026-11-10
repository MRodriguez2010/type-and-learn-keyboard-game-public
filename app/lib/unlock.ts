export const UNLOCK_SEQUENCE = "PARENT";

export type UnlockProgress = {
  buffer: string;
  unlocked: boolean;
};

export function advanceUnlock(
  buffer: string,
  key: string,
  sequence = UNLOCK_SEQUENCE,
): UnlockProgress {
  const normalizedKey = key.length === 1 ? key.toUpperCase() : "";

  if (!/^[A-Z]$/.test(normalizedKey)) {
    return { buffer: "", unlocked: false };
  }

  const candidate = `${buffer}${normalizedKey}`;

  if (candidate === sequence) {
    return { buffer: "", unlocked: true };
  }

  if (sequence.startsWith(candidate)) {
    return { buffer: candidate, unlocked: false };
  }

  return {
    buffer: normalizedKey === sequence[0] ? normalizedKey : "",
    unlocked: false,
  };
}
