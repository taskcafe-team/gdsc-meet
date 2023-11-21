/*
  Warnings:

  - You are about to drop the column `meeting_id` on the `user_meetings` table. All the data in the column will be lost.
  - Added the required column `meetingId` to the `user_meetings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_meetings" DROP CONSTRAINT "user_meetings_meeting_id_fkey";

-- AlterTable
ALTER TABLE "user_meetings" DROP COLUMN "meeting_id",
ADD COLUMN     "meetingId" UUID NOT NULL;
