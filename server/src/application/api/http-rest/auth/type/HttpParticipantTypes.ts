import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { AccessTokenMetadata } from "@infrastructure/adapter/webrtc/Types";
import { Request } from "express";

export type HttpRequestWithParticipant = Request & {
  participant?: AccessTokenMetadata;
};

export type HttpParticipantPayload = {
  id: string;
  meetingId: string;
  role: ParticipantRole;
  userId: string;
};
