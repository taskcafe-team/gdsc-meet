import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { HttpParticipantRoleAuthGuard } from "../guard/HttpParticipantRoleAuthGuard";
import { HttpParticipantAuthGuard } from "../guard/HttpParticipantAuthGuard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HttpParticipantAuth = (
  ...roles: ParticipantRole[]
): ((...args: any) => void) => {
  return applyDecorators(
    SetMetadata("participantRoles", roles),
    UseGuards(HttpParticipantAuthGuard, HttpParticipantRoleAuthGuard),
  );
};
