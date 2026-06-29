/*
  Warnings:

  - You are about to drop the `Bookmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtpCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `userId` on the `Plot` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Bookmark_userId_plotId_key";

-- DropIndex
DROP INDEX "OtpCode_phone_used_idx";

-- DropIndex
DROP INDEX "Subscription_userId_key";

-- DropIndex
DROP INDEX "User_phone_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Bookmark";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OtpCode";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Subscription";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
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
INSERT INTO "new_Plot" ("createdAt", "facing", "grant", "height", "id", "images", "note", "priceLakh", "road", "status", "street", "tag", "township", "width") SELECT "createdAt", "facing", "grant", "height", "id", "images", "note", "priceLakh", "road", "status", "street", "tag", "township", "width" FROM "Plot";
DROP TABLE "Plot";
ALTER TABLE "new_Plot" RENAME TO "Plot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
