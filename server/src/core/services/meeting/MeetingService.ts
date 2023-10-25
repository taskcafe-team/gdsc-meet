import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import { Exception } from "@core/common/exception/Exception";
import { Code } from "@core/common/code/Code";
import { Participant } from "@core/domain/participant/entity/Participant";
import { MeetingUsecaseDto } from "@core/domain/meeting/usecase/MeetingUsecaseDto";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Optional } from "@core/common/type/CommonTypes";
import { MeetingStatusEnums } from "@core/common/enums/MeetingEnums";
import { ParticipantUsecaseDto } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDto";
import { REQUEST } from "@nestjs/core";
import { HttpResponseWithOptionalUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";

class RoomEvent {
  public static readonly ReqJoinRoom: string = "room/res-join-room";
}

@Injectable()
export class MeetingService {
  private readonly maxTimeMeetMinutes: number = 100;

  constructor(
    @Inject(REQUEST)
    private readonly requestWithOptionalUser: HttpResponseWithOptionalUser,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly webRTCService: WebRTCLivekitService,
    private jwtService: JwtService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  private async getMeetingInCache(payload: {
    friendlyId: string;
  }): Promise<Optional<MeetingUsecaseDto>> {
    const { friendlyId } = payload;
    const meeting = await this.cacheService.get(`meeting:${friendlyId}`);
    return meeting as Optional<MeetingUsecaseDto>;
  }

  private async setMeetingInCache(payload: {
    key: string;
    data: MeetingUsecaseDto;
    ttl_minutes: number;
  }) {
    const { key, data, ttl_minutes } = payload;
    this.cacheService.set(`meeting:${key}`, data, ttl_minutes * 60000);
  }

  public async createMeeting(payload: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    status?: MeetingStatusEnums;
  }): Promise<MeetingUsecaseDto & { friendlyId: string }> {
    return await this.unitOfWork.runInTransaction(async () => {
      const userId = this.requestWithOptionalUser.user?.id;

      const currentuser = await this.unitOfWork
        .getUserRepository()
        .findUser({ id: userId });

      if (!currentuser)
        throw Exception.new({ code: Code.ENTITY_VALIDATION_ERROR });

      const meeting = await Meeting.new(payload);
      const friendlyId = Meeting.generatorFriendlyId();

      const participant = await Participant.new({
        meetingId: meeting.getId(),
        name: currentuser.fullName(),
        userId: currentuser.getId(),
        role: ParticipantRole.HOST,
      });

      await this.unitOfWork.getMeetingRepository().addMeeting(meeting);
      await this.unitOfWork
        .getParticipantRepository()
        .addParticipant(participant);

      await this.setMeetingInCache({
        key: friendlyId,
        data: MeetingUsecaseDto.newFromEntity(meeting),
        ttl_minutes: 120,
      });

      return {
        ...MeetingUsecaseDto.newFromEntity(meeting),
        friendlyId: friendlyId,
      };
    });
  }

  public async getMeeting(payload: {
    friendlyId: string;
  }): Promise<MeetingUsecaseDto & { friendlyId: string }> {
    const { friendlyId } = payload;
    const meeting = await this.getMeetingInCache({ friendlyId });
    if (!meeting) throw Exception.new({ code: Code.NOT_FOUND_ERROR });
    return {
      ...meeting,
      friendlyId: friendlyId,
    };
  }

  public async getAccessToken(payload: { friendlyId: string }) {
    return await this.unitOfWork.runInTransaction(async () => {
      const userId = this.requestWithOptionalUser.user?.id;
      const currentUser = await this.unitOfWork
        .getUserRepository()
        .findUser({ id: userId });
      if (!currentUser)
        throw Exception.new({ code: Code.ENTITY_NOT_FOUND_ERROR });

      const { friendlyId } = payload;
      const meetingDTO = await this.getMeetingInCache({ friendlyId });
      if (!meetingDTO) throw Exception.new({ code: Code.NOT_FOUND_ERROR });

      let participant = await this.unitOfWork
        .getParticipantRepository()
        .findParticipant({ userId, meetingId: meetingDTO.id });

      if (!participant) {
        participant = await Participant.new({
          meetingId: meetingDTO.id,
          name: currentUser.fullName(),
          role: ParticipantRole.PARTICIPANT,
          userId: currentUser.getId(),
        });
      }

      const participantDTO = ParticipantUsecaseDto.newFromEntity(participant);

      return await this.createAccessToken(meetingDTO, participantDTO);
    });
  }

  public async resJoinMeeting({ friendlyId, participantId }) {
    return await this.unitOfWork.runInTransaction(async () => {
      const meetingDTO = await this.getMeetingInCache({ friendlyId });
      if (!meetingDTO) throw Exception.new({ code: Code.NOT_FOUND_ERROR });

      const p = await this.webRTCService
        .getRoomServiceClient()
        .getParticipant(meetingDTO.id, participantId)
        .catch(() => null);

      if (!p) throw Exception.new({ code: Code.NOT_FOUND_ERROR });

      const participantDTO = JSON.parse(p.metadata) as ParticipantUsecaseDto;
      const pExit = await this.unitOfWork
        .getParticipantRepository()
        .findParticipant({
          id: participantDTO.id,
          meetingId: participantDTO.meetingId,
        });

      if (pExit) return;

      const pEntity = await Participant.new({
        id: participantDTO.id,
        meetingId: meetingDTO.id,
        name: participantDTO.name,
        role: participantDTO.role,
        userId: participantDTO.userId,
      });

      await this.unitOfWork.getParticipantRepository().addParticipant(pEntity);

      await this.webRTCService
        .getRoomServiceClient()
        .updateParticipant(meetingDTO.id, participantDTO.id, undefined, {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          hidden: false,
        });

      return null;
    });
  }

  public async getParticipant({ friendlyId, participantId }) {
    const meeting = await this.getMeetingInCache({ friendlyId });
    if (!meeting) throw Exception.new({ code: Code.NOT_FOUND_ERROR });

    const p = await this.webRTCService
      .getRoomServiceClient()
      .getParticipant(meeting.id, participantId)
      .catch(() => null);

    if (!p) throw Exception.new({ code: Code.NOT_FOUND_ERROR });

    return JSON.parse(p.metadata) as ParticipantUsecaseDto;
  }

  public async getParticipants({ friendlyId }) {
    const meeting = await this.getMeetingInCache({ friendlyId });
    if (!meeting) throw Exception.new({ code: Code.NOT_FOUND_ERROR });

    const lp = await this.webRTCService
      .getRoomServiceClient()
      .listParticipants(meeting.id);

    return lp.map<ParticipantUsecaseDto>(({ metadata }) =>
      JSON.parse(metadata),
    );
  }

  // private methods
  private async createAccessToken(
    meeting: MeetingUsecaseDto,
    participant: ParticipantUsecaseDto,
  ) {
    let status = "JOIN";
    const permission = {
      roomName: meeting.id,
      participantIdentity: participant.id,
      participantName: participant.name === "" ? "Anonymous" : participant.name,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      hidden: false,
    };

    if (meeting.status === MeetingStatusEnums.PUBLIC) {
    } else if (meeting.status === MeetingStatusEnums.PRIVATE) {
      const isExits = await this.unitOfWork
        .getParticipantRepository()
        .findParticipant({
          userId: participant.userId!,
          meetingId: meeting.id,
        });

      if (!isExits) {
        status = "WAIT";
        permission.canPublish = false;
        permission.canSubscribe = false;
        permission.canPublishData = false;
        permission.hidden = true;
      }
    }

    const token = await this.webRTCService.createToken(
      permission,
      JSON.stringify(participant),
    );

    return {
      permissions: {
        status,
      },
      token,
    };
  }
}
