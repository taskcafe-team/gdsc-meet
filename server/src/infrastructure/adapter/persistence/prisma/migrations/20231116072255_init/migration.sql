-- CreateTable
CREATE TABLE "Folder" (
    "Folder_id" UUID NOT NULL,
    "folder_name" VARCHAR(100) NOT NULL,
    "parent_folder_id" UUID,
    "user_meeting_id" UUID,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("Folder_id")
);

-- CreateTable
CREATE TABLE "user_meetings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "meeting_id" UUID NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "removed_at" TIMESTAMP,

    CONSTRAINT "user_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "File_id" UUID NOT NULL,
    "file_name" VARCHAR(100) NOT NULL,
    "folder_id" UUID NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("File_id")
);

-- CreateTable
CREATE TABLE "UserFolder" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "folder_id" UUID NOT NULL,

    CONSTRAINT "UserFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Folder_parent_folder_id_folder_name_key" ON "Folder"("parent_folder_id", "folder_name");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "Folder"("Folder_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_user_meeting_id_fkey" FOREIGN KEY ("user_meeting_id") REFERENCES "user_meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_meetings" ADD CONSTRAINT "user_meetings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_meetings" ADD CONSTRAINT "user_meetings_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("Folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFolder" ADD CONSTRAINT "UserFolder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFolder" ADD CONSTRAINT "UserFolder_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("Folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;
