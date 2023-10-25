import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Nullable } from "@core/common/type/CommonTypes";
import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { User } from "@core/domain/user/entity/User";

export type CreateParticipantEntityPayload = {
  userId?: Nullable<string>;
  meetingId: string;
  name?: string;
  role?: ParticipantRole;

  user?: Nullable<User>;
  meeting?: Nullable<Meeting>;

  id?: Nullable<string>;
  createdAt?: Nullable<Date>;
  updatedAt?: Nullable<Date>;
  removedAt?: Nullable<Date>;
};
