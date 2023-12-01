import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Request } from "express";

export type HttpRequestWithParticipant = Request & {
  participant: HttpParticipantPayload;
};

export type HttpParticipantPayload = {
  id: string;
  meetingId: string;
  name: string;
  role: ParticipantRole;
  userId?: string;
};
