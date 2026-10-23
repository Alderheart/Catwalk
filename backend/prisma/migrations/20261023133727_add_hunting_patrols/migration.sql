-- CreateTable
CREATE TABLE "camps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player_id" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "camps_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player_id" TEXT NOT NULL,
    "item_key" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "inventory_items_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "patrols" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL,
    "ends_at" DATETIME NOT NULL,
    "boost_count" INTEGER NOT NULL DEFAULT 0,
    "last_boost_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "patrols_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "patrol_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patrol_id" TEXT NOT NULL,
    "cat_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    CONSTRAINT "patrol_members_patrol_id_fkey" FOREIGN KEY ("patrol_id") REFERENCES "patrols" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "patrol_members_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age_moons" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_cats" ("age_moons", "breed", "created_at", "gender", "id", "name", "updated_at") SELECT "age_moons", "breed", "created_at", "gender", "id", "name", "updated_at" FROM "cats";
DROP TABLE "cats";
ALTER TABLE "new_cats" RENAME TO "cats";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "camps_player_id_key" ON "camps"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_player_id_item_key_key" ON "inventory_items"("player_id", "item_key");

-- CreateIndex
CREATE INDEX "patrol_members_cat_id_idx" ON "patrol_members"("cat_id");

-- CreateIndex
CREATE UNIQUE INDEX "patrol_members_patrol_id_cat_id_key" ON "patrol_members"("patrol_id", "cat_id");
