import { SendDataOptions } from "livekit-server-sdk";
import { createSendDataMessageAction } from "./Actions";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { ParticipantUsecaseDTO } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDTO";

export enum RoomType {
  DEFAULT = "default",
  MEETING = "meeting",
  WAITING = "waiting",
}

export type RoomDTO = {
  id: string;
  type: RoomType;
};
export type AccessTokenMetadata = ParticipantUsecaseDTO & {
  room: RoomDTO;
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

// ----- DTOs ----- //
export type ParticipantRequestJoinDTO = {
  participantId: string;
};

export type ParticipantSendMessageDTO = Message; //TODO: Client Chua fix
