/*
  Warnings:

  - The `tags` column on the `recipes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "overall_rating" INTEGER,
DROP COLUMN "tags",
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropEnum
DROP TYPE "recipe_tag";
