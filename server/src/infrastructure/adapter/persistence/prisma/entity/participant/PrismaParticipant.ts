import { Nullable } from "@core/common/type/CommonTypes";
import { PrismaUser } from "../user/PrismaUser";
import { Participant, ParticipantRole } from "@prisma/client";
import { PrismaMeeting } from "../meeting/PrismaMeeting";

export class PrismaParticipant implements Participant {
  id: string;
  userId: Nullable<string>;
  meetingId: string;
  name: Nullable<string>;
  role: ParticipantRole;

  user: Nullable<PrismaUser>;
  meeting: Nullable<PrismaMeeting>;

  createdAt: Date;
  updatedAt: Nullable<Date>;
  removedAt: Nullable<Date>;
}
