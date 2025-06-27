/*
  Warnings:

  - You are about to drop the column `job_id` on the `messages` table. All the data in the column will be lost.
  - Added the required column `conversation_id` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "contractor_id" TEXT NOT NULL,
    "homeowner_id" TEXT NOT NULL,
    CONSTRAINT "conversations_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "conversations_homeowner_id_fkey" FOREIGN KEY ("homeowner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_messages" ("created_at", "id", "sender_id", "text") SELECT "created_at", "id", "sender_id", "text" FROM "messages";
DROP TABLE "messages";
ALTER TABLE "new_messages" RENAME TO "messages";
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "conversations_contractor_id_idx" ON "conversations"("contractor_id");

-- CreateIndex
CREATE INDEX "conversations_homeowner_id_idx" ON "conversations"("homeowner_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_contractor_id_homeowner_id_key" ON "conversations"("contractor_id", "homeowner_id");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");
