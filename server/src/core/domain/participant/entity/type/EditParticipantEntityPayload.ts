import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { User } from "@core/domain/user/entity/User";

export type EditParticipantEntityPayload = {
  name?: string;
  userProfile?: User;
  role?: ParticipantRole;
};
