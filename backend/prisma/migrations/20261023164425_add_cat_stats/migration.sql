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
    "health" INTEGER NOT NULL DEFAULT 100,
    "max_health" INTEGER NOT NULL DEFAULT 100,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "max_energy" INTEGER NOT NULL DEFAULT 100,
    "attack" INTEGER NOT NULL DEFAULT 10,
    "defense" INTEGER NOT NULL DEFAULT 10,
    "speed" INTEGER NOT NULL DEFAULT 10,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_cats" ("age_moons", "breed", "created_at", "gender", "id", "name", "updated_at", "xp") SELECT "age_moons", "breed", "created_at", "gender", "id", "name", "updated_at", "xp" FROM "cats";
DROP TABLE "cats";
ALTER TABLE "new_cats" RENAME TO "cats";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
