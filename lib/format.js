const MM = "၀၁၂၃၄၅၆၇၈၉";

// 250 -> "၂၅၀"
export function mmNum(n) {
  return String(n ?? "").replace(/\d/g, (d) => MM[d]);
}

// 250 -> "၂၅၀ သိန်း"  (ကုဋေ over 100 lakh shown as "x ကုဋေ")
export function mmPrice(lakh) {
  if (lakh >= 10000) {
    const k = lakh / 10000;
    return `${mmNum(Number.isInteger(k) ? k : k.toFixed(2))} ကုဋေ`;
  }
  return `${mmNum(lakh)} သိန်း`;
}
