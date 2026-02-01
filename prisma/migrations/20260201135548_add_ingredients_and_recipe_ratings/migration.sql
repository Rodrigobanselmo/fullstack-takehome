/*
  Warnings:

  - You are about to drop the column `name` on the `recipe_ingredients` table. All the data in the column will be lost.
  - Added the required column `ingredient_id` to the `recipe_ingredients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recipe_ingredients" DROP COLUMN "name",
ADD COLUMN     "ingredient_id" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "price" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "difficulty_rating" INTEGER,
ADD COLUMN     "health_rating" INTEGER,
ADD COLUMN     "prep_time_minutes" INTEGER,
ADD COLUMN     "taste_rating" INTEGER;

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_unit" TEXT,
    "average_price" DECIMAL(65,30),
    "price_currency" TEXT DEFAULT 'BRL',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_files" (
    "id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredient_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

-- CreateIndex
CREATE INDEX "ingredients_user_id_idx" ON "ingredients"("user_id");

-- CreateIndex
CREATE INDEX "ingredients_name_idx" ON "ingredients"("name");

-- CreateIndex
CREATE INDEX "ingredient_files_ingredient_id_idx" ON "ingredient_files"("ingredient_id");

-- CreateIndex
CREATE INDEX "ingredient_files_file_id_idx" ON "ingredient_files"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_files_ingredient_id_file_id_key" ON "ingredient_files"("ingredient_id", "file_id");

-- CreateIndex
CREATE INDEX "recipe_ingredients_ingredient_id_idx" ON "recipe_ingredients"("ingredient_id");

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_files" ADD CONSTRAINT "ingredient_files_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_files" ADD CONSTRAINT "ingredient_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
