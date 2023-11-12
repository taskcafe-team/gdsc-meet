-- CreateEnum
CREATE TYPE "user_roles" AS ENUM ('ADMIN', 'GUEST', 'USER');

-- CreateEnum
CREATE TYPE "auth_provider_names" AS ENUM ('GOOGLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "meeting_types" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "participant_roles" AS ENUM ('HOST', 'OBSERVER', 'PARTICIPANT', 'ANONYMOUSE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "role" "user_roles" NOT NULL,
    "email" VARCHAR(100),
    "is_valid" BOOLEAN NOT NULL,
    "password" VARCHAR(100),
    "avatar" VARCHAR(100),
    "provider_name" "auth_provider_names",
    "provider_id" VARCHAR(250),
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP,
    "removed_at" TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" UUID NOT NULL,
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP,
    "title" VARCHAR(250),
    "description" VARCHAR(250),
    "type" "meeting_types" NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "removed_at" TIMESTAMP,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "user_id" UUID,
    "meeting_id" UUID NOT NULL,
    "role" "participant_roles" NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP,
    "removed_at" TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_id_key" ON "users"("provider_id");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
