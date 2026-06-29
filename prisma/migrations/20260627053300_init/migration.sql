-- CreateTable
CREATE TABLE "Plot" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
