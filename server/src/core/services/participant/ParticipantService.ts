import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { MeetingService } from "../meeting/MeetingService";
import {
  CreateTokenDTO,
  WebRTCLivekitService,
} from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import { ParticipantUsecaseDTO } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDTO";
import {
  SendMessageActionEnum,
  createSendDataMessageAction,
} from "@infrastructure/adapter/webrtc/Actions";
import {
  AccessTokenMetadata,
  Message,
  RoomType,
  SendDataMessagePort,
} from "@infrastructure/adapter/webrtc/Types";
import { HttpRequestWithParticipant } from "@application/api/http-rest/auth/type/HttpParticipantTypes";
import { REQUEST } from "@nestjs/core";
import { HttpRequestWithUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Participant } from "@core/domain/participant/entity/Participant";
import { MeetingUsecaseDTO } from "@core/domain/meeting/usecase/MeetingUsecaseDTO";
import { VideoGrant } from "livekit-server-sdk";
import { MeetingType } from "@core/common/enums/MeetingEnums";

type ParticipantSendMessagePort = {
  roomId: string;
  roomType: RoomType;
  senderId: string;
  content: string;
};

export type GetParticipantPort = {
  meetingId: string;
  participantId: string;
};

export type GetAccessTokenDTO = {
  participant: ParticipantUsecaseDTO;
  tokens: CreateTokenDTO[];
};

export type IParticipantService = {
  getAccessToken: (port: { meetingId: string }) => Promise<GetAccessTokenDTO>;
  getParticipant: (
    port: GetParticipantPort,
  ) => Promise<ParticipantUsecaseDTO & { isOnline: boolean }>;
  getParticipants: (
    meetingId: string,
  ) => Promise<(ParticipantUsecaseDTO & { isOnline: boolean })[]>;
  sendMessage: (port: ParticipantSendMessagePort) => Promise<void>;
};

@Injectable()
export default class ParticipantService implements IParticipantService {
  constructor(
    @Inject(REQUEST)
    private readonly requestWithParticipant: HttpRequestWithParticipant,
    @Inject(REQUEST)
    private readonly requestWithUser: HttpRequestWithUser,
    private readonly unitOfWork: UnitOfWork,
    private readonly meetingService: MeetingService,
    private readonly webRTCService: WebRTCLivekitService,
  ) {}

  async getAccessToken(payload: { meetingId: string }) {
    const userId = this.requestWithUser.user?.id;
    const { meetingId } = payload;
    const currentUser = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: userId });
    if (!currentUser) throw new NotFoundException("User not found!");

    const meeting = await this.meetingService.getMeeting({ meetingId });

    // Get Or Create Participant
    const participant = await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({ userId, meetingId: meeting.id })
      .then(async (p) => {
        if (p) return p;
        else
          return await Participant.new({
            meetingId: meeting.id,
            name: currentUser.fullName(),
            role: ParticipantRole.PARTICIPANT,
            userId: currentUser.getId(),
          });
      });

    const participantDTO = ParticipantUsecaseDTO.newFromEntity(participant);
    const tokens = await this.createAccessToken(meeting, participantDTO);
    return { participant: participantDTO, tokens };
  }

  async getParticipant(
    port: GetParticipantPort,
  ): Promise<ParticipantUsecaseDTO & { isOnline: boolean }> {
    const { meetingId, participantId } = port;
    const p = await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({ id: participantId, meetingId });
    if (!p) throw new NotFoundException(`Participant not found!`);
    const s = await this.webRTCService
      .getParticipant({
        roomId: p.meetingId,
        participantId: p.getId(),
        roomType: RoomType.MEETING,
      })
      .catch(() => null);

    const pDTO = ParticipantUsecaseDTO.newFromEntity(p);

    return { ...pDTO, isOnline: s !== null };
  }

  async getParticipants(
    meetingId: string,
  ): Promise<(ParticipantUsecaseDTO & { isOnline: boolean })[]> {
    const p = await this.unitOfWork
      .getParticipantRepository()
      .findManyParticipants({ meetingId });

    const psPromise = p.map(async (_p) => {
      const _pDTO = ParticipantUsecaseDTO.newFromEntity(_p);
      const is = await this.webRTCService
        .getParticipant({
          roomId: _p.meetingId,
          participantId: _p.getId(),
          roomType: RoomType.MEETING,
        })
        .catch(() => null);
      if (!is) return { ..._pDTO, isOnline: false };
      else return { ..._pDTO, isOnline: true };
    });

    return await Promise.all(psPromise);
  }

  async sendMessage(port: ParticipantSendMessagePort) {
    const { roomId, roomType, content, senderId } = port;

    const message: Message = {
      roomId,
      roomType,
      content,
      senderId,
    };

    const action = createSendDataMessageAction(
      SendMessageActionEnum.ParticipantSendMessage,
      message,
    );

    const adapter: SendDataMessagePort = {
      sendto: { roomId, roomType },
      action,
    };
    await this.webRTCService.sendDataMessage(adapter);
  }

  // Private methods
  private async createAccessToken(
    meeting: MeetingUsecaseDTO,
    participant: ParticipantUsecaseDTO,
  ) {
    if (participant.role === ParticipantRole.HOST) {
      const tokens: CreateTokenDTO[] = [];
      // Create Room Meeting Token
      const meetingPer = this.getPermissions(RoomType.MEETING);
      const meetingMeta = {
        ...participant,
        room: { id: meeting.id, type: RoomType.MEETING },
      };
      const meetingToken = await this.webRTCService.createToken({
        permissions: meetingPer,
        metadata: meetingMeta,
      });
      tokens.push(meetingToken);

      // Create Room Waiting Token
      const waitingPer = this.getPermissions(RoomType.WAITING);
      const waitingMeta = {
        ...participant,
        room: { id: meeting.id, type: RoomType.WAITING },
      };
      const waitingToken = await this.webRTCService.createToken({
        permissions: waitingPer,
        metadata: waitingMeta,
      });
      tokens.push(waitingToken);
      return tokens;
    }

    // Is not Host
    const tokens: CreateTokenDTO[] = [];
    let roomType = RoomType.MEETING;
    if (meeting.type === MeetingType.PRIVATE) {
      const canJoin = await this.unitOfWork
        .getParticipantRepository()
        .findParticipant({ id: participant.id });
      if (!canJoin) roomType = RoomType.WAITING;
    }

    const permissions: VideoGrant = this.getPermissions(roomType);
    const metadata: AccessTokenMetadata = Object.assign(participant, {
      room: { id: meeting.id, type: roomType },
    });
    const _token = await this.webRTCService.createToken({
      permissions,
      metadata,
    });
    tokens.push(_token);
    return tokens;
  }

  private getPermissions(roomType: RoomType) {
    const permissions: VideoGrant = {};
    if (roomType === RoomType.WAITING) {
      permissions.canPublish = true;
      permissions.canSubscribe = false;
      permissions.canPublishData = false;
      permissions.canPublishSources = [];
    } else {
      permissions.canPublish = true;
      permissions.canSubscribe = true;
      permissions.canPublishData = true;
    }

    return permissions;
  }
}
