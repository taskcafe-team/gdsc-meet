import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { SetMetadata } from "@nestjs/common";

export const HttpParticipantRoles = (...roles: ParticipantRole[]) =>
  SetMetadata("participantRoles", roles);
