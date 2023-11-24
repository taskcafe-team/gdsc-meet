import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Nullable } from "@core/common/type/CommonTypes";
import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { User } from "@core/domain/user/entity/User";

export type CreateParticipantEntityPayload = {
  meetingId: string;
  name: string;
  userId?: Nullable<string>;
  role?: ParticipantRole;

  user?: Nullable<User>;
  meeting?: Nullable<Meeting>;

  id?: string;
  createdAt?: Date;
  updatedAt?: Nullable<Date>;
  removedAt?: Nullable<Date>;
};
