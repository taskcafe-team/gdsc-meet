-- CreateEnum
CREATE TYPE "user_roles" AS ENUM ('ADMIN', 'GUEST', 'USER');

-- CreateEnum
CREATE TYPE "provider_name_enums" AS ENUM ('GOOGLE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "role" "user_roles" NOT NULL,
    "email" VARCHAR(100),
    "is_valid" BOOLEAN NOT NULL,
    "password" VARCHAR(100),
    "avatar" VARCHAR(100),
    "provider_name" "provider_name_enums",
    "provider_id" VARCHAR(250),
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP,
    "removed_at" TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_id_key" ON "users"("provider_id");
