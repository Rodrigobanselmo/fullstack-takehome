-- CreateTable
CREATE TABLE "subtasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "deadline" DATETIME,
    "cost" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "job_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATETIME,
    CONSTRAINT "subtasks_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "subtasks_job_id_idx" ON "subtasks"("job_id");

-- CreateIndex
CREATE INDEX "subtasks_status_idx" ON "subtasks"("status");

-- CreateIndex
CREATE INDEX "subtasks_deadline_idx" ON "subtasks"("deadline");

-- CreateIndex
CREATE INDEX "subtasks_deleted_at_idx" ON "subtasks"("deleted_at");

-- CreateIndex
CREATE INDEX "subtasks_created_at_idx" ON "subtasks"("created_at");
