// Detect Arabic characters
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const containsArabic = (text: unknown): boolean => {
  if (typeof text !== "string") return false;
  return ARABIC_REGEX.test(text);
};

/**
 * Pick value matching the requested language.
 * - If lang is "en" and value contains Arabic, return fallback (or empty).
 * - If lang is "ar" prefer Arabic; fallback otherwise.
 */
export const pickByLang = (
  value: string | undefined | null,
  lang: "en" | "ar",
  fallback?: string | null
): string => {
  const v = value?.toString().trim();
  const f = fallback?.toString().trim();
  if (lang === "en") {
    if (v && !containsArabic(v)) return v;
    if (f && !containsArabic(f)) return f;
    return "";
  }
  // ar
  if (v && containsArabic(v)) return v;
  if (f && containsArabic(f)) return f;
  return v || f || "";
};

/**
 * Strip Arabic segments from a mixed string (used as last-resort cleanup for EN UI).
 * Removes parenthesized Arabic content like "Corn (ذرة)" -> "Corn".
 */
export const stripArabic = (text: string | undefined | null): string => {
  if (!text) return "";
  return text
    // remove ( ... ) blocks that are entirely arabic
    .replace(/\s*[\(\[][^()\[\]]*[\)\]]/g, (m) => (containsArabic(m) ? "" : m))
    // remove standalone arabic words
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
};
