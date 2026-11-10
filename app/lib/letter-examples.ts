import type { Language } from "./settings.ts";

export const EXAMPLE_MOTIONS = [
  "bounce",
  "chomp",
  "flap",
  "float",
  "roll",
  "sparkle",
  "spin",
  "sway",
  "swim",
  "wiggle",
  "zoom",
] as const;

export type ExampleMotion = (typeof EXAMPLE_MOTIONS)[number];

export type LetterExample = {
  word: string;
  spoken: string;
  emoji: string;
  motion: ExampleMotion;
  audioCallout: string;
};

type ExampleSeed = readonly [
  word: string,
  emoji: string,
  motion: ExampleMotion,
];

// Generated once, then reviewed and bundled with the site. This library is
// intentionally static so picture-word play never needs a network request.
const ENGLISH_EXAMPLES: Record<string, readonly ExampleSeed[]> = {
  A: [
    ["Apple", "🍎", "chomp"],
    ["Astronaut", "🧑‍🚀", "float"],
    ["Airplane", "✈️", "zoom"],
  ],
  B: [
    ["Bat", "🦇", "flap"],
    ["Bus", "🚌", "roll"],
    ["Ball", "⚽", "bounce"],
  ],
  C: [
    ["Cat", "🐱", "bounce"],
    ["Car", "🚗", "roll"],
    ["Cookie", "🍪", "chomp"],
  ],
  D: [
    ["Dog", "🐶", "bounce"],
    ["Duck", "🦆", "swim"],
    ["Drum", "🥁", "bounce"],
  ],
  E: [
    ["Elephant", "🐘", "sway"],
    ["Egg", "🥚", "roll"],
    ["Eagle", "🦅", "flap"],
  ],
  F: [
    ["Fish", "🐟", "swim"],
    ["Frog", "🐸", "bounce"],
    ["Flower", "🌻", "sway"],
  ],
  G: [
    ["Goat", "🐐", "bounce"],
    ["Grapes", "🍇", "wiggle"],
    ["Guitar", "🎸", "sway"],
  ],
  H: [
    ["Hat", "🎩", "bounce"],
    ["Helicopter", "🚁", "spin"],
    ["Horse", "🐴", "bounce"],
  ],
  I: [
    ["Ice cream", "🍦", "sway"],
    ["Igloo", "🧊", "sparkle"],
    ["Insect", "🐞", "wiggle"],
  ],
  J: [
    ["Jellyfish", "🪼", "float"],
    ["Jet", "✈️", "zoom"],
    ["Juice", "🧃", "bounce"],
  ],
  K: [
    ["Kite", "🪁", "float"],
    ["Kitten", "🐱", "bounce"],
    ["Key", "🔑", "spin"],
  ],
  L: [
    ["Lion", "🦁", "bounce"],
    ["Leaf", "🍃", "sway"],
    ["Lamp", "💡", "sparkle"],
  ],
  M: [
    ["Moon", "🌙", "float"],
    ["Monkey", "🐒", "sway"],
    ["Muffin", "🧁", "bounce"],
  ],
  N: [
    ["Nest", "🪹", "sway"],
    ["Narwhal", "🐋", "swim"],
    ["Nose", "👃", "wiggle"],
  ],
  O: [
    ["Octopus", "🐙", "swim"],
    ["Orange", "🍊", "bounce"],
    ["Owl", "🦉", "flap"],
  ],
  P: [
    ["Penguin", "🐧", "wiggle"],
    ["Pizza", "🍕", "spin"],
    ["Pencil", "✏️", "wiggle"],
  ],
  Q: [
    ["Queen", "👑", "sparkle"],
    ["Quilt", "🧵", "sway"],
    ["Quail", "🐦", "flap"],
  ],
  R: [
    ["Rabbit", "🐇", "bounce"],
    ["Rocket", "🚀", "zoom"],
    ["Rainbow", "🌈", "sparkle"],
  ],
  S: [
    ["Sun", "☀️", "sparkle"],
    ["Snake", "🐍", "wiggle"],
    ["Sock", "🧦", "bounce"],
  ],
  T: [
    ["Turtle", "🐢", "wiggle"],
    ["Train", "🚂", "roll"],
    ["Tiger", "🐯", "bounce"],
  ],
  U: [
    ["Umbrella", "☂️", "sway"],
    ["Unicorn", "🦄", "sparkle"],
    ["Ukulele", "🎸", "sway"],
  ],
  V: [
    ["Van", "🚐", "roll"],
    ["Volcano", "🌋", "bounce"],
    ["Violin", "🎻", "sway"],
  ],
  W: [
    ["Whale", "🐋", "swim"],
    ["Wagon", "🛒", "roll"],
    ["Watermelon", "🍉", "bounce"],
  ],
  X: [
    ["Xylophone", "🎶", "bounce"],
    ["X-ray", "🩻", "sparkle"],
    ["Xerus", "🐿️", "bounce"],
  ],
  Y: [
    ["Yak", "🐂", "sway"],
    ["Yo-yo", "🪀", "spin"],
    ["Yogurt", "🥣", "bounce"],
  ],
  Z: [
    ["Zebra", "🦓", "bounce"],
    ["Zipper", "🤐", "zoom"],
    ["Zoo", "🦒", "bounce"],
  ],
};

const SPANISH_EXAMPLES: Record<string, readonly ExampleSeed[]> = {
  A: [
    ["Avión", "✈️", "zoom"],
    ["Abeja", "🐝", "float"],
    ["Árbol", "🌳", "sway"],
  ],
  B: [
    ["Barco", "⛵", "float"],
    ["Ballena", "🐋", "swim"],
    ["Bicicleta", "🚲", "roll"],
  ],
  C: [
    ["Casa", "🏠", "bounce"],
    ["Conejo", "🐇", "bounce"],
    ["Cuchara", "🥄", "sway"],
  ],
  D: [
    ["Delfín", "🐬", "swim"],
    ["Dado", "🎲", "roll"],
    ["Durazno", "🍑", "bounce"],
  ],
  E: [
    ["Elefante", "🐘", "sway"],
    ["Estrella", "⭐", "sparkle"],
    ["Escoba", "🧹", "sway"],
  ],
  F: [
    ["Foca", "🦭", "swim"],
    ["Flor", "🌻", "sway"],
    ["Fresa", "🍓", "chomp"],
  ],
  G: [
    ["Gato", "🐱", "bounce"],
    ["Globo", "🎈", "float"],
    ["Guitarra", "🎸", "sway"],
  ],
  H: [
    ["Helado", "🍦", "sway"],
    ["Hoja", "🍃", "sway"],
    ["Huevo", "🥚", "roll"],
  ],
  I: [
    ["Isla", "🏝️", "float"],
    ["Iguana", "🦎", "wiggle"],
    ["Imán", "🧲", "bounce"],
  ],
  J: [
    ["Jirafa", "🦒", "sway"],
    ["Jugo", "🧃", "bounce"],
    ["Juguete", "🧸", "bounce"],
  ],
  K: [
    ["Koala", "🐨", "sway"],
    ["Kiwi", "🥝", "roll"],
    ["Kayak", "🛶", "swim"],
  ],
  L: [
    ["Luna", "🌙", "float"],
    ["León", "🦁", "bounce"],
    ["Lápiz", "✏️", "sway"],
  ],
  M: [
    ["Mariposa", "🦋", "flap"],
    ["Mono", "🐒", "sway"],
    ["Manzana", "🍎", "chomp"],
  ],
  N: [
    ["Nube", "☁️", "float"],
    ["Nariz", "👃", "wiggle"],
    ["Nido", "🪹", "sway"],
  ],
  Ñ: [
    ["Ñandú", "🐦", "bounce"],
    ["Ñame", "🍠", "roll"],
    ["Ñoqui", "🍝", "bounce"],
  ],
  O: [
    ["Oso", "🐻", "bounce"],
    ["Oveja", "🐑", "sway"],
    ["Olla", "🍲", "sway"],
  ],
  P: [
    ["Pato", "🦆", "swim"],
    ["Pelota", "⚽", "bounce"],
    ["Pez", "🐟", "swim"],
  ],
  Q: [
    ["Queso", "🧀", "bounce"],
    ["Quetzal", "🐦", "flap"],
    ["Quitasol", "⛱️", "sway"],
  ],
  R: [
    ["Rana", "🐸", "bounce"],
    ["Reloj", "⏰", "spin"],
    ["Rueda", "🛞", "roll"],
  ],
  S: [
    ["Sol", "☀️", "sparkle"],
    ["Serpiente", "🐍", "wiggle"],
    ["Sandía", "🍉", "chomp"],
  ],
  T: [
    ["Tortuga", "🐢", "wiggle"],
    ["Tren", "🚂", "roll"],
    ["Tambor", "🥁", "bounce"],
  ],
  U: [
    ["Uvas", "🍇", "bounce"],
    ["Unicornio", "🦄", "sparkle"],
    ["Urraca", "🐦", "flap"],
  ],
  V: [
    ["Vaca", "🐄", "sway"],
    ["Velero", "⛵", "float"],
    ["Volcán", "🌋", "bounce"],
  ],
  W: [
    ["Wafle", "🧇", "bounce"],
    ["Walkie-talkie", "📻", "wiggle"],
    ["Wombat", "🐻", "bounce"],
  ],
  X: [
    ["Xilófono", "🎶", "bounce"],
    ["Xoloitzcuintle", "🐕", "wiggle"],
    ["Xilografía", "🖼️", "sparkle"],
  ],
  Y: [
    ["Yate", "🛥️", "swim"],
    ["Yoyo", "🪀", "spin"],
    ["Yuca", "🥔", "roll"],
  ],
  Z: [
    ["Zapato", "👟", "bounce"],
    ["Zorro", "🦊", "wiggle"],
    ["Zanahoria", "🥕", "sway"],
  ],
};

function calloutSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function calloutAudioPath(
  language: Language,
  letter: string,
  word: string,
) {
  const normalizedLetter = letter.toLocaleUpperCase();
  const letterId = normalizedLetter === "Ñ"
    ? "enye"
    : calloutSlug(normalizedLetter);

  return `/audio/${language}/callouts/letter-${letterId}-${calloutSlug(word)}.mp3`;
}

export function letterExamples(
  language: Language,
  letter: string,
): LetterExample[] {
  const normalizedLetter = letter.toLocaleUpperCase();
  const source =
    language === "es-419" ? SPANISH_EXAMPLES : ENGLISH_EXAMPLES;
  const seeds = source[normalizedLetter] ?? ENGLISH_EXAMPLES[normalizedLetter];

  if (!seeds) return [];

  return seeds.map(([word, emoji, motion]) => ({
    word,
    spoken: word,
    emoji,
    motion,
    audioCallout: calloutAudioPath(language, normalizedLetter, word),
  }));
}

export function pictureWordAudioPathsFor(language: Language) {
  const source =
    language === "es-419" ? SPANISH_EXAMPLES : ENGLISH_EXAMPLES;

  return Object.keys(source).flatMap((letter) =>
    letterExamples(language, letter).map((example) => example.audioCallout),
  );
}

export function isLearningCueId(id: string) {
  return id.startsWith("letter-") || id.startsWith("number-");
}

export function letterFromCueId(id: string, display: string) {
  return id.startsWith("letter-") ? display.toLocaleUpperCase() : null;
}
