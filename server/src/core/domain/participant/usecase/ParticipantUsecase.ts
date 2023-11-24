import {
  RespondJoinStatus,
  RoomType,
} from "@infrastructure/adapter/webrtc/Types";
import { ParticipantUsecaseDto } from "./dto/ParticipantUsecaseDto";
import { CreateTokenDto } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import { HttpParticipantPayload } from "@application/api/http-rest/auth/type/HttpParticipantTypes";

export type ParticipantSendMessagePort = {
  roomId: string;
  roomType: RoomType;
  senderId: string;
  content: string;
};

export type GetParticipantPort = {
  meetingId: string;
  participantId: string;
};

export type GetAccessTokenDto = {
  participant: ParticipantUsecaseDto;
  tokens: CreateTokenDto[];
};

export type getAccessTokenPort = {
  meetingId: string;
  participantId: string;
};

export type ParticipantUsecase = {
  createParticipant(): Promise<ParticipantUsecaseDto>;
  deleteParticipantById(id: string): Promise<ParticipantUsecaseDto>;
  getParticipantById(
    id: string,
  ): Promise<ParticipantUsecaseDto & { isOnline: boolean }>;

  getParticipantsInMeeting(
    meetingId: string,
  ): Promise<(ParticipantUsecaseDto & { isOnline: boolean })[]>;

  getAccessToken(payload: {
    meetingId: string;
    participantName: string;
  }): Promise<GetAccessTokenDto>;
  sendMessage(payload: ParticipantSendMessagePort): Promise<void>;
  respondJoinRequest(
    responderId: string,
    meetingId: string,
    participantIds: string[],
    status: RespondJoinStatus,
  ): Promise<void>;
};
