-- CreateTable
CREATE TABLE "cats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age_moons" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
