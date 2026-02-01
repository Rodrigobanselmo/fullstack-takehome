/*
  Warnings:

  - You are about to drop the column `difficulty_rating` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the column `health_rating` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the column `price_rating` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the column `taste_rating` on the `recipes` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "recipe_tag" AS ENUM ('FAVORITE', 'HEALTHY', 'QUICK', 'EASY', 'CHEAP', 'EXPENSIVE', 'DELICIOUS', 'COMFORT_FOOD', 'VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'LOW_CARB', 'HIGH_PROTEIN', 'SPICY', 'SWEET', 'SAVORY', 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'PARTY', 'KIDS_FRIENDLY', 'MEAL_PREP');

-- AlterTable
ALTER TABLE "recipes" DROP COLUMN "difficulty_rating",
DROP COLUMN "health_rating",
DROP COLUMN "price_rating",
DROP COLUMN "taste_rating",
ADD COLUMN     "tags" "recipe_tag"[] DEFAULT ARRAY[]::"recipe_tag"[];
