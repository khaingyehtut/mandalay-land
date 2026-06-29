import type { PhoneDetectionResult } from "@/types";

// ── Myanmar numeral map ────────────────────────────────────────────────────
const MM_DIGITS: Record<string, string> = {
  "၀": "0", "၁": "1", "၂": "2", "၃": "3", "၄": "4",
  "၅": "5", "၆": "6", "၇": "7", "၈": "8", "၉": "9",
  // Arabic-Indic (Arabic keyboard users)
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  // Thai numerals (common in border regions)
  "๐": "0", "๑": "1", "๒": "2", "๓": "3", "๔": "4",
  "๕": "5", "๖": "6", "๗": "7", "๘": "8", "๙": "9",
};

// ── Normalise a string so all numeric lookalikes become ASCII digits ────────
function normalise(text: string): string {
  // 1. Swap script-specific digits → ASCII
  let t = text.replace(/[၀-၉٠-٩๐-๙]/g, (c) => MM_DIGITS[c] ?? c);

  // 2. Swap visual lookalikes
  //    O / o / Greek omicron (ο) / full-width Ｏ / full-width ｏ → 0
  t = t.replace(/[OoοＯｏ]/g, "0");
  //    q / Q (looks like 9 in some handwriting styles) → 9
  t = t.replace(/[Qq]/g, "9");

  return t;
}

/**
 * Returns true if `text` contains a Myanmar-style phone number in any of:
 *   - Standard digits:      09xxxxxxx
 *   - Separators between:  09-123-4567 / 09 123 4567 / 09_123_4567
 *   - Obfuscated 0:         o9xxxxxxx / O9xxxxxxx / ο9xxxxxxx
 *   - International:        +9595xxxxxxx / 9595xxxxxxx
 *   - Myanmar digits:       ၀၉xxxxxxx (normalised before checking)
 *   - Myanmar words:        သုညကိုး / ဝကိုး  (spoken form)
 */
export function hasPhoneNumber(raw: string): PhoneDetectionResult {
  if (!raw || raw.trim().length === 0) return { detected: false };

  // ── Step 1: Check Myanmar spoken words BEFORE normalisation ──────────────
  //   "သုညကိုး" = zero-nine, "ဝကိုး" = zero-nine (alternate)
  if (/သုည\s*ကိုး|ဝ\s*ကိုး|ကိုး\s*ကိုး\s*ကိုး/.test(raw)) {
    return { detected: true, patternType: "myanmar-words" };
  }

  // ── Step 2: Normalise and apply digit-based patterns ─────────────────────
  const t = normalise(raw);

  // Separator class: space, dash, underscore, dot, slash, comma, interpunct, bullet
  const S = "[\\s\\-_\\.\\/,·•×]*";

  // Pattern A — Myanmar mobile: 09[0-9]{7,9} (10–11 total digits)
  //   Allows arbitrary separators between every digit.
  const mobileRe = new RegExp(`0${S}9${S}(?:[0-9]${S}){7,9}[0-9]`);
  if (mobileRe.test(t)) {
    // Check if the "0" was originally a Myanmar/obfuscated character
    const wasObfuscated = /[Ooο₀Ｏｏ]/.test(raw[raw.search(/[0OoοＯｏ]/)] ?? "");
    return {
      detected: true,
      patternType: wasObfuscated ? "obfuscated" : "standard",
    };
  }

  // Pattern B — International format: +95 9 xxxxxxx or 95 9 xxxxxxx
  const intlRe = new RegExp(`\\+?9${S}5${S}9${S}(?:[0-9]${S}){7,9}[0-9]`);
  if (intlRe.test(t)) {
    return { detected: true, patternType: "international" };
  }

  // Pattern C — Original text had Myanmar digits (already normalised above,
  //   but flag the type for better error messaging)
  if (/[၀-၉]/.test(raw)) {
    // Re-run mobile pattern on normalised text; if it hit, we already returned above.
    // If we're here, the Myanmar digits didn't form a full phone — no hit.
  }

  return { detected: false };
}

/**
 * Validate multiple fields at once.
 * Returns the name of the first field that contains a phone number, or null.
 */
export function detectPhoneInFields(
  fields: Record<string, string>
): { field: string; result: PhoneDetectionResult } | null {
  for (const [field, value] of Object.entries(fields)) {
    const result = hasPhoneNumber(value);
    if (result.detected) return { field, result };
  }
  return null;
}

/** Human-readable error message in Myanmar for phone detected in a field. */
export function phoneErrorMessage(fieldLabel: string): string {
  return `"${fieldLabel}" တွင် ဖုန်းနံပါတ် ထည့်ခွင့်မပြုပါ။ ဝယ်သူများ platform မှတဆင့် ဆက်သွယ်ရပါမည်။`;
}
