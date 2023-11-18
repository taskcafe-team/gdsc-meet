import { SendDataOptions } from "livekit-server-sdk";
import { createSendDataMessageAction } from "./Actions";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { ParticipantUsecaseDto } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDto";
import { CreateTokenDto } from "./WebRTCLivekitManagement";

export enum RoomType {
  DEFAULT = "default",
  MEETING = "meeting",
  WAITING = "waiting",
}

export type RoomDto = {
  id: string;
  type: RoomType;
};
export type AccessTokenMetadata = ParticipantUsecaseDto & {
  room: RoomDto;
};

export type SendtoOptions = {
  roomId: string;
  roomType: RoomType;
  participantIds?: SendDataOptions["destinationIdentities"];
};

export type SendDataMessagePort = {
  sendto: SendtoOptions;
  action: ReturnType<typeof createSendDataMessageAction>;
};

export type ParticipantAccessToken = {
  id: string;
  meetingId: string;
  participantRole: ParticipantRole;
};

export type Message = {
  roomId: string;
  roomType: RoomType;
  senderId: string;
  content: string;
};

// ----- Dtos ----- //
export enum RespondJoinStatus {
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  PENDING = "pending",
}

export type ParticipantRequestJoinDto = {
  status: RespondJoinStatus;
  token?: CreateTokenDto;
};

export type ParticipantSendMessageDto = Message;
