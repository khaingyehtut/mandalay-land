/**
 * ══════════════════════════════════════════════════════════════════════════════
 * PHONE DETECTION ENGINE — Mandalay Land Real Estate
 *
 * Blocks ALL known Myanmar phone number evasion techniques:
 *
 *  ① Standard formats      "09123456789", "09-123-456-789", "09 1234 5678"
 *  ② Dot / slash sep.      "09.1234.5678", "09/1234/5678"
 *  ③ Myanmar Unicode       "၀၉၁၂၃၄၅၆၇၈", "၀၉ ၁၂၃ ၄၅၆"
 *  ④ Myanmar spelled words "သုညကိုးတစ်နှစ်...", "သုည ကိုး ခုနစ် ကိုး"
 *  ⑤ English letter subs   "o9123456789", "O9...", "zero nine seven nine..."
 *  ⑥ Separator obfuscation "09-then-1234-5678", "09 dash 1234 dash 5678"
 *  ⑦ International format  "+959123456789", "959123456789"
 *  ⑧ Arabic-Indic digits   "٠٩١٢٣٤٥٦٧٨٩"
 *  ⑨ Mixed scripts         "o9١٢3456789", "09 ၁၂၃ 4567"
 *
 * FALSE POSITIVES GUARDED (must NOT block):
 *  ✓ Dimensions   "40x60 ပေ", "100*100 ကိုင်", "20 x 60"
 *  ✓ Prices       "950 သိန်း", "1500 Lakhs"     — no 09/959 prefix
 *  ✓ Dates        "28-6-2026", "09/01/2024"      — < 9 merged digits
 *  ✓ Small areas  "09 ဧကာ"                       — < 9 merged digits
 *
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ─── Myanmar digit-word → ASCII digit ─────────────────────────────────────────
// CRITICAL: longest patterns first to prevent partial-match shadowing.
// e.g. "ခြောက်" must be replaced before "ကိုး" to avoid "ခြ" + "ောက်" issues.
const MM_WORD_MAP: [RegExp, string][] = [
  [/ခြောက်/g, "6"], // six
  [/ခုနစ်/g,  "7"], // seven
  [/တစ်/g,    "1"], // one
  [/နှစ်/g,   "2"], // two
  [/သုံး/g,   "3"], // three
  [/လေး/g,    "4"], // four
  [/ငါး/g,    "5"], // five
  [/ရှစ်/g,   "8"], // eight
  [/ကိုး/g,   "9"], // nine
  [/သုည/g,    "0"], // zero (standard)
  [/ဒေါင်/g,  "0"], // zero (colloquial)
  [/ဇီးရို/g, "0"], // zero (loanword from English)
];

// ─── English number word → ASCII digit ────────────────────────────────────────
// Longest compound words first: "nineteen" before "nine", "twenty" before "two".
const EN_WORD_MAP: [RegExp, string][] = [
  [/\bnineteen\b/gi,  "19"],
  [/\beighteen\b/gi,  "18"],
  [/\bseventeen\b/gi, "17"],
  [/\bsixteen\b/gi,   "16"],
  [/\bfifteen\b/gi,   "15"],
  [/\bfourteen\b/gi,  "14"],
  [/\bthirteen\b/gi,  "13"],
  [/\btwelve\b/gi,    "12"],
  [/\beleven\b/gi,    "11"],
  [/\bthirty\b/gi,    "30"],
  [/\btwenty\b/gi,    "20"],
  [/\bzero\b/gi,  "0"],
  [/\bone\b/gi,   "1"],
  [/\btwo\b/gi,   "2"],
  [/\bthree\b/gi, "3"],
  [/\bfour\b/gi,  "4"],
  [/\bfive\b/gi,  "5"],
  [/\bsix\b/gi,   "6"],
  [/\bseven\b/gi, "7"],
  [/\beight\b/gi, "8"],
  [/\bnine\b/gi,  "9"],
  [/\bten\b/gi,   "10"],
];

/**
 * STAGE 1 — Normalize all digit representations to ASCII 0–9.
 *
 * Order matters:
 *   a) Word substitutions first (before digit scripts, in case a word
 *      contains Myanmar Unicode characters that overlap with digit ranges).
 *   b) Script normalization (Myanmar Unicode, Arabic-Indic).
 *   c) Letter substitutions last (operates on already-normalized chars).
 */
function normalize(raw: string): string {
  let t = raw;

  // (a) Myanmar spelled-out number words → ASCII digit
  for (const [re, d] of MM_WORD_MAP) t = t.replace(re, d);

  // (b) English number words → ASCII digit
  for (const [re, d] of EN_WORD_MAP) t = t.replace(re, d);

  // (c) Myanmar Unicode digits ၀–၉ (U+1040 – U+1049) → ASCII 0–9
  //     Formula: codePoint - 0x1040 gives 0–9
  t = t.replace(/[၀-၉]/g, (ch) => String(ch.codePointAt(0)! - 0x1040));

  // (d) Arabic-Indic digits ٠–٩ (U+0660 – U+0669) → ASCII 0–9
  //     Formula: codePoint - 0x0660 gives 0–9
  t = t.replace(/[٠-٩]/g, (ch) => String(ch.codePointAt(0)! - 0x0660));

  // (e) Letter substitutions — common visual spoofing:
  //     'o' / 'O' → '0'   (most frequent: "o9123456789", "O9123456789")
  //
  //     WHY global replace is safe here:
  //     Legitimate real estate text ("location", "road", "floor") will produce
  //     isolated small digit groups after this substitution — none will form
  //     a 9–11 digit sequence starting with "09" or "959".
  t = t.replace(/[oO]/g, "0");

  return t;
}

/**
 * STAGE 2 — Proximity-based digit-run merging.
 *
 * Instead of stripping ALL non-digits (which merges unrelated numbers like
 * "40 acres" + "12345678 price" into a false positive), we merge digit runs
 * that are within `maxGap` characters of each other.
 *
 * maxGap = 8 rationale:
 *   CATCHES  "09-then-1234"   → gap = "-then-" = 6 chars  ≤ 8 → merged ✓
 *   CATCHES  "09 dash 1234"   → gap = " dash " = 6 chars  ≤ 8 → merged ✓
 *   IGNORES  "09 ဧကာ and 1234567890" → gap = " ဧကာ and " = 9 chars > 8 → NOT merged ✓
 *   IGNORES  "950 lakhs at 09" → gap = " lakhs at " = 10 chars > 8 → NOT merged ✓
 *
 * Returns array of merged digit strings to check independently.
 */
function mergeNearbyDigitRuns(text: string, maxGap = 8): string[] {
  // Collect all digit runs with their start/end positions
  const RE_DIGITS = /\d+/g;
  type Run = { digits: string; start: number; end: number };
  const runs: Run[] = [];

  let m: RegExpExecArray | null;
  while ((m = RE_DIGITS.exec(text)) !== null) {
    runs.push({ digits: m[0], start: m.index, end: m.index + m[0].length });
  }
  if (runs.length === 0) return [];

  const merged: string[] = [];
  let current = runs[0].digits;
  let prevEnd = runs[0].end;

  for (let i = 1; i < runs.length; i++) {
    // gap = number of non-digit characters between the last run's end and this run's start
    const gap = runs[i].start - prevEnd;

    if (gap <= maxGap) {
      // Close enough — merge (silently drop the non-digit gap chars)
      current += runs[i].digits;
    } else {
      merged.push(current);
      current = runs[i].digits;
    }
    prevEnd = runs[i].end;
  }
  merged.push(current);
  return merged;
}

// ─── Phone pattern on digit-only string ───────────────────────────────────────
//
// Myanmar phone prefixes (after full normalization):
//   09XXXXXXX  — 09 + 7–9 more digits = 9–11 total
//                Covers: 09-5x, 09-6x, 09-7x, 09-8x, 09-9x (all operators)
//   959XXXXXXX — 959 + 7–9 more digits = 10–12 total (international)
//
// {7,9} upper bound:
//   • Blocks "09/01/2024" → after merge: "09012024" → only 6 after "09" → NO MATCH ✓
//   • Blocks land sizes and short reference IDs
//   • Catches all real Myanmar phone lengths (currently 09 + 7 or 8 digits)
//
// Why no \b word boundary on the right?
//   After digit-only extraction there are no word boundaries — \b would break.
//   The {9} max length prevents the regex from over-eating into price strings.
const PHONE_RE = /09\d{7,9}|959\d{7,9}/;

/**
 * ══ PUBLIC API ═══════════════════════════════════════════════════════════════
 *
 * isBypassingPhone(text)
 *
 * Returns `true` if `text` contains — or attempts to disguise — a Myanmar
 * mobile phone number. Use on every onChange and before form submission.
 * Mirror this on the server (Server Action / API route) for defense-in-depth.
 *
 * @example
 *   isBypassingPhone("ဖုန်း 09-123-456-789") // true
 *   isBypassingPhone("40x60 ပေ ၉၅၀ သိန်း")  // false
 *   isBypassingPhone("zero nine 1234 5678")   // true
 *   isBypassingPhone("09/01/2024 ရက်")        // false  (only 6 digits after 09)
 */
export function isBypassingPhone(text: string): boolean {
  if (!text || text.trim().length < 5) return false;

  // Full normalization pipeline
  const t = normalize(text);

  // Proximity-merged digit runs — check each merged group
  const runs = mergeNearbyDigitRuns(t);
  return runs.some((run) => PHONE_RE.test(run));
}

/**
 * Batch-check multiple form fields.
 * Returns a record of { fieldName: boolean } so you can show per-field errors.
 *
 * @example
 *   const errs = phoneErrors(form, ["street", "note", "tag", "road"]);
 *   // { street: false, note: true, tag: false, road: false }
 */
export function phoneErrors<T extends Record<string, string>>(
  fields: T,
  keys: (keyof T)[]
): Partial<Record<keyof T, boolean>> {
  return Object.fromEntries(
    keys.map((k) => [k, isBypassingPhone(String(fields[k] ?? ""))])
  ) as Partial<Record<keyof T, boolean>>;
}

// ─── Server-side helper (use inside Server Actions / API Routes) ──────────────
/**
 * Throws a structured error if any of the provided field values contain a phone.
 * Import and call this at the top of your Server Action before DB operations.
 *
 * @example — in a Server Action:
 *   import { assertNoPhone } from "@/lib/phoneDetect";
 *   assertNoPhone({ street: b.street, note: b.note, tag: b.tag, road: b.road });
 */
export function assertNoPhone(fields: Record<string, string | null | undefined>): void {
  const violations = Object.entries(fields)
    .filter(([, v]) => isBypassingPhone(v ?? ""))
    .map(([k]) => k);

  if (violations.length > 0) {
    const err = new Error("ဖုန်းနံပါတ် ထည့်၍ မရပါ");
    (err as Error & { status: number; fields: string[] }).status = 400;
    (err as Error & { status: number; fields: string[] }).fields = violations;
    throw err;
  }
}
