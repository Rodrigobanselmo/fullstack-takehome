-- CreateIndex
CREATE INDEX "conversations_created_at_idx" ON "conversations"("created_at");

-- CreateIndex
CREATE INDEX "jobs_contractor_id_idx" ON "jobs"("contractor_id");

-- CreateIndex
CREATE INDEX "jobs_homeowner_id_idx" ON "jobs"("homeowner_id");

-- CreateIndex
CREATE INDEX "jobs_deleted_at_idx" ON "jobs"("deleted_at");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_created_at_idx" ON "jobs"("created_at");
