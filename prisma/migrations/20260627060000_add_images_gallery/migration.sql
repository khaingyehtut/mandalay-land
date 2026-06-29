-- Add images column (JSON array), migrate existing image, drop old column
ALTER TABLE "Plot" ADD COLUMN "images" TEXT;
UPDATE "Plot" SET "images" = json_array("image") WHERE "image" IS NOT NULL;
-- RedefineTables to drop old column (SQLite workaround)
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "township" TEXT NOT NULL,
    "street" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "grant" TEXT NOT NULL,
    "priceLakh" INTEGER NOT NULL,
    "facing" TEXT,
    "road" TEXT,
    "tag" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "note" TEXT,
    "images" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Plot" SELECT "id","township","street","width","height","grant","priceLakh","facing","road","tag","status","note","images","createdAt" FROM "Plot";
DROP TABLE "Plot";
ALTER TABLE "new_Plot" RENAME TO "Plot";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
