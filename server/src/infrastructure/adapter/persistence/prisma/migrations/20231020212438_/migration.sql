/*
  Warnings:

  - Made the column `name` on table `participants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "participants" ALTER COLUMN "name" SET NOT NULL;
