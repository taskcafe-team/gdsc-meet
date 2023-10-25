-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_meeting_id_fkey";

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
