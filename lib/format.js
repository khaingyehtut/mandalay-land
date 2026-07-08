const MM = "၀၁၂၃၄၅၆၇၈၉";

// 250 -> "၂၅၀"
export function mmNum(n) {
  return String(n ?? "").replace(/\d/g, (d) => MM[d]);
}

export function mmPrice(lakh) {
  return `${mmNum(lakh)} သိန်း`;
}
