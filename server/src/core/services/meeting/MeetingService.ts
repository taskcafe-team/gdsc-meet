import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import { Exception } from "@core/common/exception/Exception";
import Code from "@core/common/constants/Code";
import { Participant } from "@core/domain/participant/entity/Participant";
import { MeetingUsecaseDto } from "@core/domain/meeting/usecase/MeetingUsecaseDto";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Optional } from "@core/common/type/CommonTypes";
import { MeetingStatusEnums } from "@core/common/enums/MeetingEnums";
import { ParticipantUsecaseDto } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDto";
import { REQUEST } from "@nestjs/core";
import { HttpResponseWithOptionalUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import {
  SendDataMessageDTO,
  SendDataMessageMeetingAction,
} from "@infrastructure/adapter/webrtc/Types";
import { CreateAccessTokenPort } from "@core/domain/meeting/port/CreateAccessTokenPort";

@Injectable()
export class MeetingService {
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

      if (!currentuser) throw Exception.newFromCode(Code.NOT_FOUND_ERROR);

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

  public async getMyMeetings(): Promise<Meeting[]> {
    const userId = this.requestWithOptionalUser.user?.id;
    if (!userId) throw new InternalServerErrorException("User not found!");
    const participantWithMyHost = await this.unitOfWork
      .getParticipantRepository()
      .findManyParticipants({
        userId: userId,
        role: ParticipantRole.HOST,
      });
    const myMeetings = participantWithMyHost.map((p) => p.meeting!);
    return myMeetings;
  }

  public async deleteMeetings(payload: { meetingIds: string[] }) {
    return await this.unitOfWork.runInTransaction(async () => {
      const userId = this.requestWithOptionalUser.user?.id;
      if (!userId) throw new InternalServerErrorException("User not found!");

      const meetings = await this.unitOfWork
        .getParticipantRepository()
        .findManyParticipants({
          userId: userId,
          role: ParticipantRole.HOST,
          meetingIds: payload.meetingIds,
        })
        .then((participants) => participants.map((p) => p.meeting!))
        .catch(() => []);
      if (meetings.length !== payload.meetingIds.length)
        throw new BadRequestException("Invalid argument");
      return await this.unitOfWork
        .getMeetingRepository()
        .deleteMeetings({ ids: payload.meetingIds });
    });
  }

  public async getMeeting(payload: {
    friendlyId: string;
  }): Promise<MeetingUsecaseDto & { friendlyId: string }> {
    const { friendlyId } = payload;
    const meeting = await this.getMeetingInCache({ friendlyId });
    if (!meeting) throw new NotFoundException("Meeting not found!");
    return {
      friendlyId: friendlyId,
      ...meeting,
    };
  }

  public async getAccessToken(payload: { friendlyId: string }) {
    return await this.unitOfWork.runInTransaction(async () => {
      // Get Current User
      const currentUser = await this.unitOfWork
        .getUserRepository()
        .findUser({ id: this.requestWithOptionalUser.user?.id });
      if (!currentUser) throw new NotFoundException("User not found!");

      // Get MeetingDto by friendlyId in Cache
      const meetingDTO = await this.getMeetingInCache({
        friendlyId: payload.friendlyId,
      });
      if (!meetingDTO) throw new NotFoundException("Meeting not found!");

      // Get or create participant
      let participant = await this.unitOfWork
        .getParticipantRepository()
        .findParticipant({
          userId: currentUser.getId(),
          meetingId: meetingDTO.id,
        });

      if (!participant) {
        participant = await Participant.new({
          meetingId: meetingDTO.id,
          name: currentUser.fullName(),
          role: ParticipantRole.PARTICIPANT,
          userId: currentUser.getId(),
        });
      }
      const participantDTO = ParticipantUsecaseDto.newFromEntity(participant);

      // create token
      return await this.createAccessToken(meetingDTO, participantDTO);
    });
  }

  public async requestJoinMeeting(payload: { token: string }) {
    // Verify meeting token created from webrtc
    const verifyToken = this.webRTCService.verifyToken<ParticipantUsecaseDto>(
      payload.token,
    );
    if (!verifyToken) throw new UnauthorizedException("Token invalid!");
    if (!verifyToken.metadata)
      throw new InternalServerErrorException("request join meeting error");
    const participantDTO = verifyToken.metadata;

    // Check meet is start

    // Get host is online
    const hostDomain = await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({
        meetingId: participantDTO.meetingId,
        role: ParticipantRole.HOST,
      });
    if (!hostDomain) throw new NotFoundException("Host is not online!");
    const id = hostDomain.getId();
    const hostIsOnline = await this.webRTCService
      .getParticipant(hostDomain.meetingId, hostDomain.getId())
      .catch(() => undefined);
    if (!hostIsOnline) throw new NotFoundException("Host is not online!");

    // Send message request join meeting to host
    const sendMessagePayload: SendDataMessageDTO = {
      action: SendDataMessageMeetingAction.request_join,
      data: {
        participantId: participantDTO.id,
        participantName: participantDTO.name,
      },
    };

    await this.webRTCService.sendMessage({
      sendto: {
        meetingId: hostDomain.meetingId,
        participantIds: [hostDomain.getId()],
      },
      payload: sendMessagePayload,
    });
  }

  public async resJoinMeeting({ friendlyId, participantId }) {
    return await this.unitOfWork.runInTransaction(async () => {
      const meetingDTO = await this.getMeetingInCache({ friendlyId });
      if (!meetingDTO) throw Exception.newFromCode(Code.NOT_FOUND_ERROR);

      const p = await this.webRTCService._roomServiceClient
        .getParticipant(meetingDTO.id, participantId)
        .catch(() => null);

      if (!p) throw Exception.newFromCode(Code.NOT_FOUND_ERROR);

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

      await this.webRTCService._roomServiceClient.updateParticipant(
        meetingDTO.id,
        participantDTO.id,
        undefined,
        {
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          hidden: false,
        },
      );

      return null;
    });
  }

  public async getParticipant({ friendlyId, participantId }) {
    const meeting = await this.getMeetingInCache({ friendlyId });
    if (!meeting) throw Exception.newFromCode(Code.NOT_FOUND_ERROR);

    const p = await this.webRTCService._roomServiceClient
      .getParticipant(meeting.id, participantId)
      .catch(() => null);

    if (!p) throw Exception.newFromCode(Code.NOT_FOUND_ERROR);

    return JSON.parse(p.metadata) as ParticipantUsecaseDto;
  }

  public async getParticipants({ friendlyId }) {
    const meeting = await this.getMeetingInCache({ friendlyId });
    if (!meeting) throw Exception.newFromCode(Code.NOT_FOUND_ERROR);

    const lp = await this.webRTCService._roomServiceClient.listParticipants(
      meeting.id,
    );

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
    const createAccessTokenPayload: CreateAccessTokenPort = {
      meetingId: meeting.id,
      participantId: participant.id,
      participantName: participant.name === "" ? "Anonymous" : participant.name,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      hidden: false,
    };

    if (meeting.status === MeetingStatusEnums.PUBLIC) {
    } else if (meeting.status === MeetingStatusEnums.PRIVATE) {
      // Check if the user has already subscribed to the meeting
      const participantExits = await this.unitOfWork
        .getParticipantRepository()
        .findParticipant({ id: participant.id });

      if (!participantExits) {
        status = "WAIT";
        createAccessTokenPayload.canPublish = false;
        createAccessTokenPayload.canSubscribe = false;
        createAccessTokenPayload.canPublishData = false;
        createAccessTokenPayload.hidden = true;
      }
    }

    const token = await this.webRTCService.createToken<ParticipantUsecaseDto>(
      createAccessTokenPayload,
      participant,
    );

    return {
      permissions: {
        status,
      },
      token,
    };
  }
}
