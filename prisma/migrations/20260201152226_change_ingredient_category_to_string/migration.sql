/*
  Warnings:

  - The `category` column on the `ingredients` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ingredients" DROP COLUMN "category",
ADD COLUMN     "category" TEXT;

-- DropEnum
DROP TYPE "ingredient_category";

-- CreateIndex
CREATE INDEX "ingredients_category_idx" ON "ingredients"("category");
