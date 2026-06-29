/*
  Warnings:

  - Added the required column `userId` to the `Plot` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Plot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Plot" ("createdAt", "facing", "grant", "height", "id", "images", "note", "priceLakh", "road", "status", "street", "tag", "township", "width") SELECT "createdAt", "facing", "grant", "height", "id", "images", "note", "priceLakh", "road", "status", "street", "tag", "township", "width" FROM "Plot";
DROP TABLE "Plot";
ALTER TABLE "new_Plot" RENAME TO "Plot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
