export type PlotStatus = "available" | "pending" | "sold";

export interface Plot {
  id: number;
  township: string;
  street?: string | null;
  width: number;
  height: number;
  grant: string;
  priceLakh: number;
  facing?: string | null;
  road?: string | null;
  tag?: string | null;
  status: PlotStatus;
  note?: string | null;
  images: string[];
  createdAt: Date;
}

export interface ActionResult<T = void> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface PhoneDetectionResult {
  detected: boolean;
  patternType?: "standard" | "international" | "obfuscated" | "myanmar-digits" | "myanmar-words";
}
