import { SendDataOptions } from "livekit-server-sdk";
import { createSendDataMessageAction } from "./Actions";

export interface SendtoOptions {
  meetingId: string;
  participantIds: SendDataOptions["destinationIdentities"];
}

export interface SendDataMessagePort {
  sendto: SendtoOptions;
  action: ReturnType<typeof createSendDataMessageAction>;
}

// ----- DTOs ----- //
export interface ParticipantRequestJoinDTO {
  participantId: string;
}

export interface ParticipantSendMessageDTO {
  sendby: string;
  message: string;
}
