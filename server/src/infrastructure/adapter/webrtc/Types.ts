import { SendDataOptions, VideoGrant } from "livekit-server-sdk";
import { createSendDataMessageAction } from "./Actions";
import { ParticipantMetadataDTO } from "@core/domain/participant/usecase/dto/ParticipantMetadataDTO";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";

export interface SendtoOptions {
  meetingId: string;
  participantIds: SendDataOptions["destinationIdentities"];
}

export interface SendDataMessagePort {
  sendto: SendtoOptions;
  action: ReturnType<typeof createSendDataMessageAction>;
}

export interface ParticipantAccessToken {
  id: string;
  meetingId: string;
  participantRole: ParticipantRole;
}

// ----- DTOs ----- //
export interface ParticipantRequestJoinDTO {
  participantId: string;
}

export interface ParticipantSendMessageDTO {
  sendby: string;
  message: string;
}
