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
import { File } from "buffer";

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

  public async getAccessToken(payload: { friendlyId: string }) {
    const currentUserId = "29c20509-a050-4a4a-b206-2643edf388d9";
    const currentuser = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: currentUserId });

    const meeting = await this.getMeeting(payload);

    const participant = await Participant.new({
      meetingId: "",
      name: currentuser!.fullName(),
      role: ParticipantRole.PARTICIPANT,
    });

    const token = await this.webRTCService.createToken({
      participantIdentity: participant.getId(),
      participantName: participant.name!,
      roomName: meeting.friendlyId,
      roomJoin: true,
    });

    return token;
  }

  public async createAccessToken(payload: {
    friendlyId: string;
    participantId: string;
  }) {
    return;
  }
}
