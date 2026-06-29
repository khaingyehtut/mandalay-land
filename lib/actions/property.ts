"use server";

import { prisma } from "@/lib/db";
import { detectPhoneInFields, phoneErrorMessage } from "@/lib/utils/phoneFilter";
import type { ActionResult } from "@/types";
import { redirect } from "next/navigation";

const FIELD_LABELS: Record<string, string> = {
  street: "လမ်း/ရပ်ကွက်",
  description: "ဖော်ပြချက်",
  note: "မှတ်ချက်",
};

export async function uploadListing(
  _prev: ActionResult<{ id: number }>,
  formData: FormData
): Promise<ActionResult<{ id: number }>> {
  const township = (formData.get("township") as string)?.trim();
  const street = (formData.get("street") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() ?? "";
  const note = (formData.get("note") as string)?.trim() ?? "";
  const width = parseInt(formData.get("width") as string);
  const height = parseInt(formData.get("height") as string);
  const priceLakh = parseInt(formData.get("priceLakh") as string);
  const grant = (formData.get("grant") as string)?.trim();
  const facing = (formData.get("facing") as string)?.trim() ?? null;
  const road = (formData.get("road") as string)?.trim() ?? null;
  const tag = (formData.get("tag") as string)?.trim() ?? null;
  const imagesJson = (formData.get("images") as string) ?? "[]";

  if (!township) return { error: "မြို့နယ် ရွေးချယ်ပါ။" };
  if (isNaN(width) || width <= 0) return { error: "အကျယ် ထည့်ပါ။" };
  if (isNaN(height) || height <= 0) return { error: "အမြင့် ထည့်ပါ။" };
  if (isNaN(priceLakh) || priceLakh <= 0) return { error: "ဈေးနှုန်း ထည့်ပါ။" };
  if (!grant) return { error: "ဂရန်အမျိုးအစား ထည့်ပါ။" };

  // Server-side phone detection gate
  const phoneCheck = detectPhoneInFields({ street, description, note });
  if (phoneCheck) {
    return { error: phoneErrorMessage(FIELD_LABELS[phoneCheck.field] ?? phoneCheck.field) };
  }

  let images: string[] = [];
  try {
    images = JSON.parse(imagesJson);
    if (!Array.isArray(images)) images = [];
    images = images
      .filter((u: unknown) => typeof u === "string" && u.startsWith("/uploads/"))
      .slice(0, 6);
  } catch {
    images = [];
  }

  const plot = await prisma.plot.create({
    data: {
      township,
      street: street || null,
      width,
      height,
      grant,
      priceLakh,
      facing,
      road,
      tag,
      note: note || null,
      images: JSON.stringify(images),
      status: "available",
    },
  });

  redirect(`/?highlight=${plot.id}`);
}
