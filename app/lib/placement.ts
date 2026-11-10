export type KeyPlacement = {
  xVw: number;
  yVh: number;
};

export const PLACEMENT_BOUNDS = {
  character: { xVw: 8, yVh: 7 },
  word: { xVw: 4, yVh: 11 },
} as const;

function hashIdentity(identity: string): number {
  let hash = 2166136261;

  for (const character of identity) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function unitFromSeed(seed: number): number {
  let value = seed >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  value ^= value >>> 15;
  return (value >>> 0) / 0xffffffff;
}

function roundPosition(value: number): number {
  return Math.round(value * 100) / 100;
}

export function placementFor(
  renderId: number,
  identity: string,
  isWord: boolean,
): KeyPlacement {
  const bounds = isWord
    ? PLACEMENT_BOUNDS.word
    : PLACEMENT_BOUNDS.character;
  const seed =
    hashIdentity(identity) ^ Math.imul(renderId + 1, 0x9e3779b1);
  const xUnit = unitFromSeed(seed);
  const yUnit = unitFromSeed(seed ^ 0x85ebca6b);

  return {
    xVw: roundPosition((xUnit * 2 - 1) * bounds.xVw),
    yVh: roundPosition((yUnit * 2 - 1) * bounds.yVh),
  };
}
