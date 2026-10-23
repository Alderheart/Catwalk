-- CreateTable
CREATE TABLE "personalities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cat_id" TEXT NOT NULL,
    "main_trait" TEXT NOT NULL,
    "side_trait" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "personalities_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "personalities_cat_id_key" ON "personalities"("cat_id");
