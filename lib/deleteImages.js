import { unlink } from "fs/promises";
import path from "path";

export async function deleteUploadedImages(imagesJson) {
  let urls = [];
  try { urls = JSON.parse(imagesJson || "[]"); } catch { return; }
  if (!Array.isArray(urls) || urls.length === 0) return;

  await Promise.allSettled(
    urls
      .filter(u => typeof u === "string" && u.startsWith("/uploads/"))
      .map(u => {
        const file = path.join(process.cwd(), "public", u);
        return unlink(file);
      })
  );
}
