/*
  Warnings:

  - You are about to drop the column `category` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the `jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subtasks` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,user_id]` on the table `ingredients` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ingredients" DROP CONSTRAINT "ingredients_user_id_fkey";

-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_contractor_id_fkey";

-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_homeowner_id_fkey";

-- DropForeignKey
ALTER TABLE "subtasks" DROP CONSTRAINT "subtasks_job_id_fkey";

-- DropIndex
DROP INDEX "ingredients_category_idx";

-- DropIndex
DROP INDEX "ingredients_embedding_idx";

-- DropIndex
DROP INDEX "ingredients_name_key";

-- DropIndex
DROP INDEX "ingredients_name_trgm_idx";

-- DropIndex
DROP INDEX "ingredients_user_id_name_idx";

-- AlterTable
ALTER TABLE "ingredients" DROP COLUMN "category",
ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "user_id" DROP NOT NULL;

-- DropTable
DROP TABLE "jobs";

-- DropTable
DROP TABLE "subtasks";

-- DropEnum
DROP TYPE "JobStatus";

-- DropEnum
DROP TYPE "SubtaskStatus";

-- CreateIndex
CREATE INDEX "ingredients_categories_idx" ON "ingredients"("categories");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_user_id_key" ON "ingredients"("name", "user_id");

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
