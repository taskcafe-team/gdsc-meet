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
import { User } from "@prisma/client";

@Injectable()
export class MeetingService {
  private readonly maxTimeMeetMinutes: number = 100;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly webRTCService: WebRTCLivekitService,
    private jwtService: JwtService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  private async getMeetingInCache(payload: {
    friendlyId: string;
  }): Promise<Optional<Meeting>> {
    const { friendlyId } = payload;
    const meeting = await this.cacheService.get(`meeting:${friendlyId}`);
    return meeting as Optional<Meeting>;
  }

  private async setMeetingInCache(payload: {
    key: string;
    data: Meeting;
    ttl_minutes: number;
  }) {
    const { key, data, ttl_minutes } = payload;
    this.cacheService.set(`meeting:${key}`, data, ttl_minutes * 60000);
  }

  public async createMeeting(payload: {
    currentUserId: string;
  }): Promise<MeetingUsecaseDto & { friendlyId: string }> {
    return await this.unitOfWork.runInTransaction(async () => {
      const { currentUserId } = payload;
      const currentuser = await this.unitOfWork
        .getUserRepository()
        .findUser({ id: currentUserId });

      const meeting = await Meeting.new({});
      const friendlyId = Meeting.generatorFriendlyId();

      const participant = await Participant.new({
        meetingId: meeting.getId(),
        name: currentuser!.fullName(),
        userId: currentUserId,
        role: ParticipantRole.HOST,
      });

      await this.unitOfWork.getMeetingRepository().addMeeting(meeting);
      await this.unitOfWork
        .getParticipantRepository()
        .addParticipant(participant);

      await this.setMeetingInCache({
        key: friendlyId,
        data: meeting,
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
      ...MeetingUsecaseDto.newFromEntity(meeting),
      friendlyId: friendlyId,
    };
  }

  public async getAccessToken(payload: {
    friendlyId: string;
    currentUserId: string;
  }) {
    return await this.unitOfWork.runInTransaction(async () => {
      const { friendlyId, currentUserId } = payload;

      const currentuser = await this.unitOfWork
        .getUserRepository()
        .findUser({ id: currentUserId });

      if (!currentuser)
        throw Exception.new({ code: Code.ENTITY_NOT_FOUND_ERROR });

      const meeting = await this.getMeeting({ friendlyId });

      let participant = await this.unitOfWork
        .getParticipantRepository()
        .findParticipant({ userId: currentuser.getId() });

      if (!participant) {
        participant = await Participant.new({
          meetingId: meeting.id,
          name: currentuser.fullName(),
          role: ParticipantRole.PARTICIPANT,
        });
        await this.unitOfWork
          .getParticipantRepository()
          .addParticipant(participant);
      }

      return await this.createAccessToken(meeting, participant);
    });
  }

  private async createAccessToken(
    meeting: MeetingUsecaseDto,
    participant: Participant,
  ) {
    let status = "";
    const permission = {
      roomName: meeting.id,
      participantIdentity: participant.getId(),
      participantName: participant.name!,
    };

    if (meeting.status === MeetingStatusEnums.PUBLIC) {
      status = "JOIN";
    } else if (meeting.status === MeetingStatusEnums.PRIVATE) {
      status = "WAIT";
    }
    status = "JOIN";
    permission.roomName = `${status}:{meeting.id}`;

    const token = await this.webRTCService.createToken(permission);
    return {
      permissions: {
        status,
      },
      token,
    };
  }
}
