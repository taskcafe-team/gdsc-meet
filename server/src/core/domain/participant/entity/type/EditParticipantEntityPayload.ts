import { ParticipantRole } from "@core/common/enums/ParticipantEnums";

export type EditParticipantEntityPayload = {
  name?: string;
  role?: ParticipantRole;
};
