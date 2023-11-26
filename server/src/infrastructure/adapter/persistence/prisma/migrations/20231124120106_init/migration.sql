-- CreateTable
CREATE TABLE "folders" (
    "Folder_id" UUID NOT NULL,
    "folder_name" VARCHAR(100) NOT NULL,
    "parent_folder_id" UUID,
    "user_meeting_id" UUID,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("Folder_id")
);

-- CreateTable
CREATE TABLE "user_meetings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "removed_at" TIMESTAMP,

    CONSTRAINT "user_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "File_id" UUID NOT NULL,
    "file_name" VARCHAR(100) NOT NULL,
    "folder_id" UUID NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("File_id")
);

-- CreateTable
CREATE TABLE "user_folders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "folder_id" UUID NOT NULL,

    CONSTRAINT "user_folders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "folders_parent_folder_id_folder_name_key" ON "folders"("parent_folder_id", "folder_name");

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "folders"("Folder_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_meeting_id_fkey" FOREIGN KEY ("user_meeting_id") REFERENCES "user_meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_meetings" ADD CONSTRAINT "user_meetings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("Folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_folders" ADD CONSTRAINT "user_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_folders" ADD CONSTRAINT "user_folders_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("Folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;
