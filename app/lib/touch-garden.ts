import type { Language } from "./settings.ts";

export const TOUCH_GARDEN_MAX_CHOICES = 6;

const TOUCH_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");

export function touchKeysFor(language: Language) {
  return language === "es-419"
    ? TOUCH_KEYS.flatMap((key) => (key === "N" ? ["N", "Ñ"] : [key]))
    : [...TOUCH_KEYS];
}

export function touchGardenPages(language: Language) {
  const keys = touchKeysFor(language);
  const pageCount = Math.ceil(keys.length / TOUCH_GARDEN_MAX_CHOICES);
  const minimumPageSize = Math.floor(keys.length / pageCount);
  const largerPages = keys.length % pageCount;
  const pages: string[][] = [];
  let offset = 0;

  for (let page = 0; page < pageCount; page += 1) {
    const pageSize = minimumPageSize + (page < largerPages ? 1 : 0);
    pages.push(keys.slice(offset, offset + pageSize));
    offset += pageSize;
  }

  return pages;
}
