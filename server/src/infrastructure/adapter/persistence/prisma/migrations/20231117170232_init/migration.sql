/*
  Warnings:

  - You are about to drop the column `meetingId` on the `user_meetings` table. All the data in the column will be lost.
  - Added the required column `meeting_id` to the `user_meetings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_meetings" DROP COLUMN "meetingId",
ADD COLUMN     "meeting_id" UUID NOT NULL;
