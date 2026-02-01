-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_files" (
    "id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_group_files" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_group_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_key_key" ON "files"("key");

-- CreateIndex
CREATE INDEX "files_uploaded_by_idx" ON "files"("uploaded_by");

-- CreateIndex
CREATE INDEX "files_created_at_idx" ON "files"("created_at");

-- CreateIndex
CREATE INDEX "files_deleted_at_idx" ON "files"("deleted_at");

-- CreateIndex
CREATE INDEX "recipe_files_recipe_id_idx" ON "recipe_files"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_files_file_id_idx" ON "recipe_files"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_files_recipe_id_file_id_unique" ON "recipe_files"("recipe_id", "file_id");

-- CreateIndex
CREATE INDEX "recipe_group_files_group_id_idx" ON "recipe_group_files"("group_id");

-- CreateIndex
CREATE INDEX "recipe_group_files_file_id_idx" ON "recipe_group_files"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_group_files_group_id_file_id_unique" ON "recipe_group_files"("group_id", "file_id");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_files" ADD CONSTRAINT "recipe_files_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_files" ADD CONSTRAINT "recipe_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_group_files" ADD CONSTRAINT "recipe_group_files_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "recipe_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_group_files" ADD CONSTRAINT "recipe_group_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
