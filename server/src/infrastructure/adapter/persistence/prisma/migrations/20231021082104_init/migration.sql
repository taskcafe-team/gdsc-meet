-- CreateTable
CREATE TABLE "Subject" (
    "subject_id" UUID NOT NULL,
    "subject_name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "semester" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "UserSubject" (
    "UserSubject_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,

    CONSTRAINT "UserSubject_pkey" PRIMARY KEY ("UserSubject_id")
);

-- AddForeignKey
ALTER TABLE "UserSubject" ADD CONSTRAINT "UserSubject_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubject" ADD CONSTRAINT "UserSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;
