import { ParticipantUsecaseDto } from "./dto/ParticipantUsecaseDto";
import { ParticipantSendMessageDTO } from "./dto/ParticipantSendMessageDTO";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { HttpParticipantPayload } from "@application/api/http-rest/auth/type/HttpParticipantTypes";

export type AccessPermissionsStatus = "wait" | "accept" | "reject";
export type ParticipantAccessTokenDTO = {
  token: string;
  status: AccessPermissionsStatus;
  participant: HttpParticipantPayload & { name: string };
};

export type ParticipantUsecase = {
  createParticipant(dto: {
    name: string;
    userId?: string;
    meetingId: string;
    role: ParticipantRole;
  }): Promise<ParticipantUsecaseDto>;
  getParticipantInRoomById(
    roomId: string,
    partId: string,
  ): Promise<ParticipantUsecaseDto>;
  sendMessage(dto: ParticipantSendMessageDTO): Promise<void>;
  getParticipantAccessToken(
    roomId: string,
    partId: string,
    partName?: string,
  ): Promise<ParticipantAccessTokenDTO>;
  getRoomAccessToken(
    roomId: string,
    part: HttpParticipantPayload,
  ): Promise<{ token: string }>;
  respondJoinRequest(
    responder: HttpParticipantPayload,
    meetingId: string,
    partIds: string[],
    status: AccessPermissionsStatus,
  ): Promise<void>;
  // getParticipantsInMeeting(
  //   meetingId: string,
  // ): Promise<(ParticipantUsecaseDto & { isOnline: boolean })[]>;

  // getParticipantByUserIdAndMeetingId(
  //   userId: string,
  //   meetingId: string,
  // ): Promise<ParticipantUsecaseDto & { isOnline: boolean }>;
  // getAccessToken(payload: {
  //   meetingId: string;
  //   participantName: string;
  // }): Promise<GetAccessTokenDto>;
  // respondJoinRequest(
  //   responderId: string,
  //   meetingId: string,
  //   participantIds: string[],
  //   status: RespondJoinStatus,
  // ): Promise<void>;
  // // deleteParticipantById(id: string): Promise<ParticipantUsecaseDto>;
  // updateMyMeeting( //TODO: fix
  //   updater: HttpUserPayload,
  //   updateId: string,
  //   payload: UpdateMeetingPort,
  // ): Promise<void>;
};
