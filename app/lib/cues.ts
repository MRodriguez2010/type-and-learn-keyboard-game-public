import type { Language } from "./settings.ts";

export type ColorSlot = "ivory" | "butter" | "sage" | "sky" | "coral";

export type LocalizedText = Record<Language, string>;

export type CueDefinition = {
  id: string;
  identity: string;
  display: string;
  spokenName: LocalizedText;
  vocalCue?: Partial<LocalizedText>;
  audio: Record<
    Language,
    {
      name: string;
      vocal?: string;
    }
  >;
  colorSlot: ColorSlot;
  isWord: boolean;
};

export type ResolvedCue = CueDefinition & {
  language: Language;
  spoken: string;
  vocal?: string;
  audioName?: string;
  audioVocal?: string;
};

type LetterSource = {
  id: string;
  display: string;
  names: LocalizedText;
  vocal: LocalizedText;
  ttsNames: LocalizedText;
  ttsVocal: LocalizedText;
};

const LETTER_SOURCES: LetterSource[] = [
  ["a", "A", "A", "a", "ah-ah", "a-a", "Ay", "a", "Ah, ah", "a, a"],
  ["b", "B", "B", "be", "ba-ba", "ba-ba", "Bee", "be", "Ba, ba", "Ba, ba"],
  ["c", "C", "C", "ce", "cuckoo", "cu-cú", "See", "ce", "Cuckoo, cuckoo", "Cu-cú, cu-cú"],
  ["d", "D", "D", "de", "da-da", "da-da", "Dee", "de", "Da, da", "Da, da"],
  ["e", "E", "E", "e", "ee-ee", "e-e", "E", "e", "Eee, eee", "E, e"],
  ["f", "F", "F", "efe", "fffff", "fffff", "Eff", "efe", "Fffff", "Fffff"],
  ["g", "G", "G", "ge", "goo-goo", "gu-gu", "Gee", "ge", "Goo, goo", "Gu, gu"],
  ["h", "H", "H", "hache", "ha-ha", "hola-hola", "Aitch", "hache", "Ha, ha", "Hola, hola"],
  ["i", "I", "I", "i", "hi-hi", "i-i", "Eye", "i", "Hi, hi", "I, i"],
  ["j", "J", "J", "jota", "ja-ja", "ja-ja", "Jay", "jota", "Ja, ja", "Ja, ja"],
  ["k", "K", "K", "ka", "click-click", "ki-ki", "Kay", "ka", "Click, click", "Ki, ki"],
  ["l", "L", "L", "ele", "la-la", "la-la", "El", "ele", "La, la", "La, la"],
  ["m", "M", "M", "eme", "mmm", "mmm", "Em", "eme", "Mmm", "Mmm"],
  ["n", "N", "N", "ene", "na-na", "na-na", "En", "ene", "Na, na", "Na, na"],
  ["enye", "Ñ", "eñe", "eñe", "ña-ña", "ña-ña", "Eñe", "eñe", "Ña, ña", "Ña, ña"],
  ["o", "O", "O", "o", "oh-oh", "o-o", "Oh", "o", "Oh, oh", "O, o"],
  ["p", "P", "P", "pe", "pa-pa", "pa-pa", "Pea", "pe", "Pa, pa", "Pa, pa"],
  ["q", "Q", "Q", "cu", "quack-quack", "cuac-cuac", "Cue", "cu", "Quack, quack", "Cuac, cuac"],
  ["r", "R", "R", "erre", "grr-grr", "grr-grr", "Are", "erre", "Grr, grr", "Grr, grr"],
  ["s", "S", "S", "ese", "sssss", "sssss", "Ess", "ese", "Sssss", "Sssss"],
  ["t", "T", "T", "te", "ta-ta", "ta-ta", "Tee", "te", "Ta, ta", "Ta, ta"],
  ["u", "U", "U", "u", "uh-oh", "uy-uy", "You", "u", "Uh-oh", "Uy, uy"],
  ["v", "V", "V", "uve", "vroom-vroom", "va-va", "Vee", "uve", "Vroom, vroom", "Va, va"],
  ["w", "W", "W", "uve doble", "woo-hoo", "guau-guau", "Double-u", "uve doble", "Woo-hoo", "Guau, guau"],
  ["x", "X", "X", "equis", "ding-ding", "tilín-tilín", "Ex", "equis", "Ding, ding", "Tilín, tilín"],
  ["y", "Y", "Y", "ye", "yay-yay", "ya-ya", "Why", "ye", "Yay, yay", "Ya, ya"],
  ["z", "Z", "Z", "zeta", "zzzzz", "zum-zum", "Zee", "zeta", "Zzzzz", "Zum, zum"],
].map(
  ([
    id,
    display,
    enName,
    esName,
    enVocal,
    esVocal,
    enTtsName,
    esTtsName,
    enTtsVocal,
    esTtsVocal,
  ]) => ({
    id,
    display,
    names: { "en-US": enName, "es-419": esName },
    vocal: { "en-US": enVocal, "es-419": esVocal },
    ttsNames: { "en-US": enTtsName, "es-419": esTtsName },
    ttsVocal: { "en-US": enTtsVocal, "es-419": esTtsVocal },
  }),
);

export const DIGIT_NAMES: Record<string, LocalizedText> = {
  "0": { "en-US": "zero", "es-419": "cero" },
  "1": { "en-US": "one", "es-419": "uno" },
  "2": { "en-US": "two", "es-419": "dos" },
  "3": { "en-US": "three", "es-419": "tres" },
  "4": { "en-US": "four", "es-419": "cuatro" },
  "5": { "en-US": "five", "es-419": "cinco" },
  "6": { "en-US": "six", "es-419": "seis" },
  "7": { "en-US": "seven", "es-419": "siete" },
  "8": { "en-US": "eight", "es-419": "ocho" },
  "9": { "en-US": "nine", "es-419": "nueve" },
};

type NamedKeySource = {
  id: string;
  display: LocalizedText;
  names: LocalizedText;
};

export const SPECIAL_KEY_SOURCES: Record<string, NamedKeySource> = {
  " ": {
    id: "space",
    display: { "en-US": "SPACE", "es-419": "ESPACIO" },
    names: { "en-US": "space", "es-419": "espacio" },
  },
  Spacebar: {
    id: "space",
    display: { "en-US": "SPACE", "es-419": "ESPACIO" },
    names: { "en-US": "space", "es-419": "espacio" },
  },
  Enter: {
    id: "enter",
    display: { "en-US": "ENTER", "es-419": "INTRO" },
    names: { "en-US": "enter", "es-419": "intro" },
  },
  Backspace: {
    id: "backspace",
    display: { "en-US": "BACKSPACE", "es-419": "BORRAR" },
    names: { "en-US": "backspace", "es-419": "borrar" },
  },
  Delete: {
    id: "delete",
    display: { "en-US": "DELETE", "es-419": "SUPRIMIR" },
    names: { "en-US": "delete", "es-419": "suprimir" },
  },
  Tab: {
    id: "tab",
    display: { "en-US": "TAB", "es-419": "TABULADOR" },
    names: { "en-US": "tab", "es-419": "tabulador" },
  },
  Escape: {
    id: "escape",
    display: { "en-US": "ESCAPE", "es-419": "ESCAPE" },
    names: { "en-US": "escape", "es-419": "escape" },
  },
  Shift: {
    id: "shift",
    display: { "en-US": "SHIFT", "es-419": "MAYÚSCULAS" },
    names: { "en-US": "shift", "es-419": "mayúsculas" },
  },
  CapsLock: {
    id: "caps-lock",
    display: { "en-US": "CAPS", "es-419": "BLOQ MAYÚS" },
    names: {
      "en-US": "caps lock",
      "es-419": "bloqueo de mayúsculas",
    },
  },
  Control: {
    id: "control",
    display: { "en-US": "CONTROL", "es-419": "CONTROL" },
    names: { "en-US": "control", "es-419": "control" },
  },
  Alt: {
    id: "alt",
    display: { "en-US": "ALT", "es-419": "ALT" },
    names: { "en-US": "alt", "es-419": "alt" },
  },
  Meta: {
    id: "meta",
    display: { "en-US": "SYSTEM", "es-419": "SISTEMA" },
    names: { "en-US": "system key", "es-419": "tecla de sistema" },
  },
  ArrowUp: {
    id: "arrow-up",
    display: { "en-US": "UP", "es-419": "ARRIBA" },
    names: { "en-US": "up", "es-419": "arriba" },
  },
  ArrowDown: {
    id: "arrow-down",
    display: { "en-US": "DOWN", "es-419": "ABAJO" },
    names: { "en-US": "down", "es-419": "abajo" },
  },
  ArrowLeft: {
    id: "arrow-left",
    display: { "en-US": "LEFT", "es-419": "IZQUIERDA" },
    names: { "en-US": "left", "es-419": "izquierda" },
  },
  ArrowRight: {
    id: "arrow-right",
    display: { "en-US": "RIGHT", "es-419": "DERECHA" },
    names: { "en-US": "right", "es-419": "derecha" },
  },
  Home: {
    id: "home",
    display: { "en-US": "HOME", "es-419": "INICIO" },
    names: { "en-US": "home", "es-419": "inicio" },
  },
  End: {
    id: "end",
    display: { "en-US": "END", "es-419": "FIN" },
    names: { "en-US": "end", "es-419": "fin" },
  },
  PageUp: {
    id: "page-up",
    display: { "en-US": "PAGE UP", "es-419": "PÁGINA ARRIBA" },
    names: { "en-US": "page up", "es-419": "página arriba" },
  },
  PageDown: {
    id: "page-down",
    display: { "en-US": "PAGE DOWN", "es-419": "PÁGINA ABAJO" },
    names: { "en-US": "page down", "es-419": "página abajo" },
  },
  Insert: {
    id: "insert",
    display: { "en-US": "INSERT", "es-419": "INSERTAR" },
    names: { "en-US": "insert", "es-419": "insertar" },
  },
};

export const PUNCTUATION_SOURCES: Record<string, NamedKeySource> = {
  ".": { id: "period", display: { "en-US": ".", "es-419": "." }, names: { "en-US": "period", "es-419": "punto" } },
  ",": { id: "comma", display: { "en-US": ",", "es-419": "," }, names: { "en-US": "comma", "es-419": "coma" } },
  "?": { id: "question", display: { "en-US": "?", "es-419": "?" }, names: { "en-US": "question mark", "es-419": "signo de interrogación" } },
  "!": { id: "exclamation", display: { "en-US": "!", "es-419": "!" }, names: { "en-US": "exclamation mark", "es-419": "signo de exclamación" } },
  "+": { id: "plus", display: { "en-US": "+", "es-419": "+" }, names: { "en-US": "plus", "es-419": "más" } },
  "-": { id: "minus", display: { "en-US": "-", "es-419": "-" }, names: { "en-US": "minus", "es-419": "menos" } },
  "=": { id: "equals", display: { "en-US": "=", "es-419": "=" }, names: { "en-US": "equals", "es-419": "igual" } },
  "/": { id: "slash", display: { "en-US": "/", "es-419": "/" }, names: { "en-US": "slash", "es-419": "barra" } },
  "\\": { id: "backslash", display: { "en-US": "\\", "es-419": "\\" }, names: { "en-US": "backslash", "es-419": "barra inversa" } },
  "'": { id: "apostrophe", display: { "en-US": "'", "es-419": "'" }, names: { "en-US": "apostrophe", "es-419": "apóstrofo" } },
  '"': { id: "quotation", display: { "en-US": '"', "es-419": '"' }, names: { "en-US": "quotation mark", "es-419": "comillas" } },
  "@": { id: "at", display: { "en-US": "@", "es-419": "@" }, names: { "en-US": "at sign", "es-419": "arroba" } },
  "#": { id: "number-sign", display: { "en-US": "#", "es-419": "#" }, names: { "en-US": "number sign", "es-419": "numeral" } },
  "*": { id: "star", display: { "en-US": "*", "es-419": "*" }, names: { "en-US": "star", "es-419": "estrella" } },
  "(": { id: "left-parenthesis", display: { "en-US": "(", "es-419": "(" }, names: { "en-US": "left parenthesis", "es-419": "abre paréntesis" } },
  ")": { id: "right-parenthesis", display: { "en-US": ")", "es-419": ")" }, names: { "en-US": "right parenthesis", "es-419": "cierra paréntesis" } },
  "[": { id: "left-bracket", display: { "en-US": "[", "es-419": "[" }, names: { "en-US": "left bracket", "es-419": "corchete izquierdo" } },
  "]": { id: "right-bracket", display: { "en-US": "]", "es-419": "]" }, names: { "en-US": "right bracket", "es-419": "corchete derecho" } },
  "{": { id: "left-brace", display: { "en-US": "{", "es-419": "{" }, names: { "en-US": "left brace", "es-419": "llave izquierda" } },
  "}": { id: "right-brace", display: { "en-US": "}", "es-419": "}" }, names: { "en-US": "right brace", "es-419": "llave derecha" } },
  ":": { id: "colon", display: { "en-US": ":", "es-419": ":" }, names: { "en-US": "colon", "es-419": "dos puntos" } },
  ";": { id: "semicolon", display: { "en-US": ";", "es-419": ";" }, names: { "en-US": "semicolon", "es-419": "punto y coma" } },
  "_": { id: "underscore", display: { "en-US": "_", "es-419": "_" }, names: { "en-US": "underscore", "es-419": "guion bajo" } },
  "<": { id: "less-than", display: { "en-US": "<", "es-419": "<" }, names: { "en-US": "less than", "es-419": "menor que" } },
  ">": { id: "greater-than", display: { "en-US": ">", "es-419": ">" }, names: { "en-US": "greater than", "es-419": "mayor que" } },
  "|": { id: "vertical-bar", display: { "en-US": "|", "es-419": "|" }, names: { "en-US": "vertical bar", "es-419": "barra vertical" } },
  "`": { id: "backtick", display: { "en-US": "`", "es-419": "`" }, names: { "en-US": "backtick", "es-419": "acento grave" } },
  "~": { id: "tilde", display: { "en-US": "~", "es-419": "~" }, names: { "en-US": "tilde", "es-419": "virgulilla" } },
  "$": { id: "dollar", display: { "en-US": "$", "es-419": "$" }, names: { "en-US": "dollar sign", "es-419": "signo de dólar" } },
  "%": { id: "percent", display: { "en-US": "%", "es-419": "%" }, names: { "en-US": "percent sign", "es-419": "por ciento" } },
  "^": { id: "caret", display: { "en-US": "^", "es-419": "^" }, names: { "en-US": "caret", "es-419": "acento circunflejo" } },
  "&": { id: "ampersand", display: { "en-US": "&", "es-419": "&" }, names: { "en-US": "ampersand", "es-419": "y comercial" } },
};

const COLOR_SLOTS: ColorSlot[] = ["butter", "sage", "sky", "coral", "ivory"];

function colorFor(identity: string): ColorSlot {
  let hash = 0;
  for (const character of identity) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return COLOR_SLOTS[hash % COLOR_SLOTS.length];
}

function audioFor(id: string, hasVocal = false): CueDefinition["audio"] {
  return {
    "en-US": {
      name: `/audio/en-US/${id}.name.mp3`,
      vocal: hasVocal ? `/audio/en-US/${id}.vocal.mp3` : undefined,
    },
    "es-419": {
      name: `/audio/es-419/${id}.name.mp3`,
      vocal: hasVocal ? `/audio/es-419/${id}.vocal.mp3` : undefined,
    },
  };
}

function fromLetter(source: LetterSource): CueDefinition {
  const id = `letter-${source.id}`;
  return {
    id,
    identity: id,
    display: source.display,
    spokenName: source.names,
    vocalCue: source.vocal,
    audio: audioFor(id, true),
    colorSlot: colorFor(id),
    isWord: false,
  };
}

export const LETTER_DEFINITIONS = LETTER_SOURCES.map(fromLetter);
const LETTER_BY_DISPLAY = new Map(
  LETTER_DEFINITIONS.map((definition) => [definition.display, definition]),
);

function namedDefinition(
  source: NamedKeySource,
  language: Language,
  identityPrefix: string,
): CueDefinition {
  const id = `${identityPrefix}-${source.id}`;
  return {
    id,
    identity: id,
    display: source.display[language],
    spokenName: source.names,
    audio: audioFor(id),
    colorSlot: colorFor(id),
    isWord: source.display[language].length > 2,
  };
}

export function describeKey(key: string, language: Language): ResolvedCue {
  const normalizedLetter = key.length === 1 ? key.toLocaleUpperCase() : "";
  const letter = LETTER_BY_DISPLAY.get(normalizedLetter);

  let definition: CueDefinition;

  if (letter) {
    definition = letter;
  } else if (/^[0-9]$/.test(key)) {
    const id = `number-${key}`;
    definition = {
      id,
      identity: id,
      display: key,
      spokenName: DIGIT_NAMES[key],
      audio: audioFor(id),
      colorSlot: colorFor(id),
      isWord: false,
    };
  } else if (SPECIAL_KEY_SOURCES[key]) {
    definition = namedDefinition(SPECIAL_KEY_SOURCES[key], language, "key");
  } else if (PUNCTUATION_SOURCES[key]) {
    definition = namedDefinition(
      PUNCTUATION_SOURCES[key],
      language,
      "punctuation",
    );
  } else {
    const friendly = key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^Key/, "")
      .trim();
    const spoken =
      friendly ||
      (language === "es-419" ? "tecla desconocida" : "unknown key");
    const id = `unknown-${spoken.toLocaleLowerCase().replace(/\s+/g, "-")}`;
    definition = {
      id,
      identity: id,
      display: friendly.toLocaleUpperCase() || "KEY",
      spokenName: { "en-US": spoken, "es-419": spoken },
      audio: {
        "en-US": { name: "" },
        "es-419": { name: "" },
      },
      colorSlot: colorFor(id),
      isWord: true,
    };
  }

  const localizedAudio = definition.audio[language];

  return {
    ...definition,
    language,
    display:
      SPECIAL_KEY_SOURCES[key]?.display[language] ??
      PUNCTUATION_SOURCES[key]?.display[language] ??
      definition.display,
    spoken: definition.spokenName[language],
    vocal: definition.vocalCue?.[language],
    audioName: localizedAudio.name || undefined,
    audioVocal: localizedAudio.vocal,
  };
}

export type VoiceGenerationItem = {
  id: string;
  language: Language;
  kind: "name" | "vocal";
  input: string;
  output: string;
};

export function voiceGenerationItems(): VoiceGenerationItem[] {
  const items: VoiceGenerationItem[] = [];

  for (const source of LETTER_SOURCES) {
    const id = `letter-${source.id}`;
    for (const language of ["en-US", "es-419"] as const) {
      items.push({
        id,
        language,
        kind: "name",
        input: source.ttsNames[language],
        output: `public/audio/${language}/${id}.name.mp3`,
      });
      items.push({
        id,
        language,
        kind: "vocal",
        input: source.ttsVocal[language],
        output: `public/audio/${language}/${id}.vocal.mp3`,
      });
    }
  }

  for (const [digit, names] of Object.entries(DIGIT_NAMES)) {
    const id = `number-${digit}`;
    for (const language of ["en-US", "es-419"] as const) {
      items.push({
        id,
        language,
        kind: "name",
        input: names[language],
        output: `public/audio/${language}/${id}.name.mp3`,
      });
    }
  }

  const uniqueNamedSources = new Map<string, NamedKeySource>();
  for (const source of Object.values(SPECIAL_KEY_SOURCES)) {
    uniqueNamedSources.set(`key-${source.id}`, source);
  }
  for (const source of Object.values(PUNCTUATION_SOURCES)) {
    uniqueNamedSources.set(`punctuation-${source.id}`, source);
  }

  for (const [id, source] of uniqueNamedSources) {
    for (const language of ["en-US", "es-419"] as const) {
      items.push({
        id,
        language,
        kind: "name",
        input: source.names[language],
        output: `public/audio/${language}/${id}.name.mp3`,
      });
    }
  }

  return items;
}

export function audioPathsFor(language: Language) {
  return voiceGenerationItems()
    .filter((item) => item.language === language)
    .map((item) => `/${item.output.replace(/^public\//, "")}`);
}
