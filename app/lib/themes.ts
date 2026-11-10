import type { CSSProperties } from "react";
import type { ColorSlot } from "./cues";
import type { Language, ThemeId } from "./settings";

type ThemeDefinition = {
  name: Record<Language, string>;
  description: Record<Language, string>;
  tokens: {
    night: string;
    surface: string;
    surfaceRaised: string;
    line: string;
    lineStrong: string;
    ivory: string;
    muted: string;
    dim: string;
    butter: string;
    sage: string;
    sky: string;
    coral: string;
    decor: string;
  };
  colors: Record<ColorSlot, string>;
};

export const THEME_IDS: readonly ThemeId[] = [
  "space",
  "sea",
  "robots",
  "school",
  "rainbows",
  "birthday",
];

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  space: {
    name: { "en-US": "Space", "es-419": "Espacio" },
    description: {
      "en-US": "Rockets, planets & stars",
      "es-419": "Cohetes, planetas y estrellas",
    },
    tokens: {
      night: "#080A16",
      surface: "#101427",
      surfaceRaised: "#171C32",
      line: "#303750",
      lineStrong: "#4A5473",
      ivory: "#ECEAF6",
      muted: "#AAAEC4",
      dim: "#767C96",
      butter: "#E4C878",
      sage: "#AEB4DE",
      sky: "#7EA5C9",
      coral: "#D78C98",
      decor: "#9AA4C4",
    },
    colors: {
      ivory: "#ECEAF6",
      butter: "#E4C878",
      sage: "#AEB4DE",
      sky: "#7EA5C9",
      coral: "#D78C98",
    },
  },
  sea: {
    name: { "en-US": "Sea", "es-419": "Mar" },
    description: {
      "en-US": "Ships, waves & fish",
      "es-419": "Barcos, olas y peces",
    },
    tokens: {
      night: "#071311",
      surface: "#0D1D1A",
      surfaceRaised: "#142724",
      line: "#29453F",
      lineStrong: "#41645C",
      ivory: "#E8F1EB",
      muted: "#A7BAB2",
      dim: "#748E84",
      butter: "#DDC67B",
      sage: "#8DBAA8",
      sky: "#78AFC2",
      coral: "#D58F7D",
      decor: "#83AFA4",
    },
    colors: {
      ivory: "#E8F1EB",
      butter: "#DDC67B",
      sage: "#8DBAA8",
      sky: "#78AFC2",
      coral: "#D58F7D",
    },
  },
  robots: {
    name: { "en-US": "Robots", "es-419": "Robots" },
    description: {
      "en-US": "Bots, screens & binary",
      "es-419": "Robots, pantallas y binario",
    },
    tokens: {
      night: "#0A1012",
      surface: "#11191C",
      surfaceRaised: "#182429",
      line: "#2D4146",
      lineStrong: "#466169",
      ivory: "#E8EEEB",
      muted: "#A4B3AE",
      dim: "#718580",
      butter: "#D7C176",
      sage: "#87B8A6",
      sky: "#7DAFC0",
      coral: "#D58E79",
      decor: "#82AAA2",
    },
    colors: {
      ivory: "#E8EEEB",
      butter: "#D7C176",
      sage: "#87B8A6",
      sky: "#7DAFC0",
      coral: "#D58E79",
    },
  },
  school: {
    name: { "en-US": "School", "es-419": "Escuela" },
    description: {
      "en-US": "Books, buses & numbers",
      "es-419": "Libros, autobuses y números",
    },
    tokens: {
      night: "#110E0A",
      surface: "#1A1610",
      surfaceRaised: "#241E17",
      line: "#443A2B",
      lineStrong: "#665743",
      ivory: "#F0E7D3",
      muted: "#BBAD94",
      dim: "#887B65",
      butter: "#E2C56E",
      sage: "#93B49A",
      sky: "#82AAC1",
      coral: "#DA8B76",
      decor: "#AE9B78",
    },
    colors: {
      ivory: "#F0E7D3",
      butter: "#E2C56E",
      sage: "#93B49A",
      sky: "#82AAC1",
      coral: "#DA8B76",
    },
  },
  rainbows: {
    name: { "en-US": "Rainbows", "es-419": "Arcoíris" },
    description: {
      "en-US": "Clouds, flowers & hearts",
      "es-419": "Nubes, flores y corazones",
    },
    tokens: {
      night: "#110C15",
      surface: "#1B131F",
      surfaceRaised: "#25192B",
      line: "#443047",
      lineStrong: "#634967",
      ivory: "#F2E8EE",
      muted: "#BBA8B6",
      dim: "#897686",
      butter: "#E4C979",
      sage: "#9ABDA3",
      sky: "#8EB2CC",
      coral: "#DA90A4",
      decor: "#B49AAF",
    },
    colors: {
      ivory: "#F2E8EE",
      butter: "#E4C979",
      sage: "#9ABDA3",
      sky: "#8EB2CC",
      coral: "#DA90A4",
    },
  },
  birthday: {
    name: { "en-US": "Birthday", "es-419": "Cumpleaños" },
    description: {
      "en-US": "Toys, balloons & pets",
      "es-419": "Juguetes, globos y mascotas",
    },
    tokens: {
      night: "#130C0C",
      surface: "#1F1413",
      surfaceRaised: "#291B19",
      line: "#49312C",
      lineStrong: "#6A4A43",
      ivory: "#F2E5D8",
      muted: "#BBAA9D",
      dim: "#88756B",
      butter: "#E3C575",
      sage: "#A4B690",
      sky: "#8EACC2",
      coral: "#DE8E82",
      decor: "#B69A8E",
    },
    colors: {
      ivory: "#F2E5D8",
      butter: "#E3C575",
      sage: "#A4B690",
      sky: "#8EACC2",
      coral: "#DE8E82",
    },
  },
};

function glow(color: string, alpha: number) {
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function themeVariables(themeId: ThemeId): CSSProperties {
  const { tokens } = THEMES[themeId];

  return {
    "--night": tokens.night,
    "--surface": tokens.surface,
    "--surface-raised": tokens.surfaceRaised,
    "--line": tokens.line,
    "--line-strong": tokens.lineStrong,
    "--ivory": tokens.ivory,
    "--muted": tokens.muted,
    "--dim": tokens.dim,
    "--butter": tokens.butter,
    "--sage": tokens.sage,
    "--sky": tokens.sky,
    "--coral": tokens.coral,
    "--focus": tokens.ivory,
    "--decor": tokens.decor,
    "--selection-surface": glow(tokens.sage, 0.1),
    "--note-surface": glow(tokens.sage, 0.055),
    "--note-line": glow(tokens.sage, 0.2),
    "--accent-hover": glow(tokens.butter, 0.92),
    "--button-ink": tokens.night,
  } as CSSProperties;
}

export function keyGlow(themeId: ThemeId, colorSlot: ColorSlot) {
  const alpha = colorSlot === "ivory" ? 0.24 : 0.3;
  return glow(THEMES[themeId].colors[colorSlot], alpha);
}
