-- AlterEnum
ALTER TYPE "AIMessageRole" ADD VALUE 'tool';

-- AlterTable
ALTER TABLE "ai_messages" ADD COLUMN     "tool_name" TEXT,
ADD COLUMN     "tool_status" TEXT;
