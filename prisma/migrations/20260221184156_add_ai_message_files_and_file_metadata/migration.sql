-- AlterTable
ALTER TABLE "files" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "ai_message_files" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_message_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_message_files_message_id_idx" ON "ai_message_files"("message_id");

-- CreateIndex
CREATE INDEX "ai_message_files_file_id_idx" ON "ai_message_files"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_message_files_message_id_file_id_unique" ON "ai_message_files"("message_id", "file_id");

-- AddForeignKey
ALTER TABLE "ai_message_files" ADD CONSTRAINT "ai_message_files_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ai_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_message_files" ADD CONSTRAINT "ai_message_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
