-- CreateEnum
CREATE TYPE "ingredient_category" AS ENUM ('VEGETABLES', 'FRUITS', 'GRAINS', 'PROTEINS', 'DAIRY', 'OILS_FATS', 'SPICES_HERBS', 'CONDIMENTS', 'BAKING', 'BEVERAGES', 'SNACKS', 'FROZEN', 'CANNED', 'PASTA_NOODLES', 'NUTS_SEEDS', 'SWEETENERS', 'OTHER');

-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "category" "ingredient_category";

-- AlterTable
ALTER TABLE "recipe_ingredients" ADD COLUMN     "optional" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "price_rating" INTEGER;

-- CreateIndex
CREATE INDEX "ingredients_category_idx" ON "ingredients"("category");
