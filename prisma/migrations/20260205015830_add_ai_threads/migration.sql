-- CreateEnum
CREATE TYPE "AIMessageRole" AS ENUM ('user', 'assistant');

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "instructions" TEXT;

-- CreateTable
CREATE TABLE "ai_threads" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "role" "AIMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_threads_user_id_idx" ON "ai_threads"("user_id");

-- CreateIndex
CREATE INDEX "ai_threads_created_at_idx" ON "ai_threads"("created_at");

-- CreateIndex
CREATE INDEX "ai_threads_deleted_at_idx" ON "ai_threads"("deleted_at");

-- CreateIndex
CREATE INDEX "ai_messages_thread_id_idx" ON "ai_messages"("thread_id");

-- CreateIndex
CREATE INDEX "ai_messages_created_at_idx" ON "ai_messages"("created_at");

-- AddForeignKey
ALTER TABLE "ai_threads" ADD CONSTRAINT "ai_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "ai_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
