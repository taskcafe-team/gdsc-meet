-- CreateTable
CREATE TABLE "Subject" (
    "subject_id" UUID NOT NULL,
    "subject_name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "semester" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "UserSubject" (
    "user_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,

    CONSTRAINT "UserSubject_pkey" PRIMARY KEY ("user_id","subject_id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "Folder_id" UUID NOT NULL,
    "folder_name" VARCHAR(100) NOT NULL,
    "parent_folder_id" UUID,
    "userId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("Folder_id")
);

-- CreateTable
CREATE TABLE "Doc" (
    "Doc_id" UUID NOT NULL,
    "folder_id" UUID NOT NULL,
    "content" VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP,

    CONSTRAINT "Doc_pkey" PRIMARY KEY ("Doc_id")
);

-- CreateTable
CREATE TABLE "UserFolder" (
    "user_id" UUID NOT NULL,
    "folder_id" UUID NOT NULL,

    CONSTRAINT "UserFolder_pkey" PRIMARY KEY ("user_id","folder_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Folder_userId_subjectId_key" ON "Folder"("userId", "subjectId");

-- AddForeignKey
ALTER TABLE "UserSubject" ADD CONSTRAINT "UserSubject_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubject" ADD CONSTRAINT "UserSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "Folder"("Folder_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_subjectId_fkey" FOREIGN KEY ("userId", "subjectId") REFERENCES "UserSubject"("user_id", "subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doc" ADD CONSTRAINT "Doc_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("Folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFolder" ADD CONSTRAINT "UserFolder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFolder" ADD CONSTRAINT "UserFolder_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("Folder_id") ON DELETE RESTRICT ON UPDATE CASCADE;
