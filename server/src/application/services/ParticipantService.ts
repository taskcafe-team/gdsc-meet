import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateTokenDto,
  WebRTCLivekitService,
} from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import { ParticipantUsecaseDto } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDto";
import {
  AccessTokenMetadata,
  Message,
  RespondJoinStatus,
  RoomType,
  SendDataMessagePort,
} from "@infrastructure/adapter/webrtc/Types";
import { REQUEST } from "@nestjs/core";
import {
  HttpRequestWithUser,
  HttpUserPayload,
} from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Participant } from "@core/domain/participant/entity/Participant";
import { MeetingUsecaseDto } from "@core/domain/meeting/usecase/dto/MeetingUsecaseDto";
import { VideoGrant } from "livekit-server-sdk";
import { MeetingType } from "@core/common/enums/MeetingEnums";
import { MeetingService } from "./MeetingService";
import { Meeting } from "@core/domain/meeting/entity/Meeting";
import {
  GetAccessTokenDto,
  ParticipantSendMessagePort,
  ParticipantUsecase,
} from "@core/domain/participant/usecase/ParticipantUsecase";
import { AppException } from "@core/common/exception/AppException";
import { AppErrors } from "@core/common/exception/AppErrors";
import {
  SendMessageActionEnum,
  createSendDataMessageAction,
} from "@infrastructure/adapter/webrtc/Actions";
import { UserService } from "./UserService";
import { MeetingUsecase } from "@core/domain/meeting/usecase/MeetingUsecase";
import { UpdateMeetingPort } from "@core/domain/meeting/usecase/port/UpdateMeetingPort";
import { HttpParticipantPayload } from "@application/api/http-rest/auth/type/HttpParticipantTypes";

@Injectable()
export class ParticipantService implements ParticipantUsecase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    @Inject(REQUEST)
    private readonly requestWithUser: HttpRequestWithUser,
    @Inject(MeetingService)
    private readonly meetingService: MeetingUsecase,
    private readonly userService: UserService,
    private readonly webRTCService: WebRTCLivekitService,
  ) {}
  createParticipant(): Promise<ParticipantUsecaseDto> {
    throw new Error("Method not implemented.");
  }

  async getParticipantById(
    id: string,
  ): Promise<ParticipantUsecaseDto & { isOnline: boolean }> {
    const participant = await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({ id });
    if (!participant) throw new NotFoundException("Participant not found!");

    const participantOnline = await this.webRTCService
      .getParticipant({
        roomId: participant.meetingId,
        participantId: participant.id,
        roomType: RoomType.MEETING,
      })
      .catch(() => null);

    const isOnline = Boolean(participantOnline);
    return { ...ParticipantUsecaseDto.newFromEntity(participant), isOnline };
  }

  async getParticipantsInMeeting(
    meetingId: string,
  ): Promise<(ParticipantUsecaseDto & { isOnline: boolean })[]> {
    const meeting = await this.meetingService.getMeetingById(meetingId);

    const listParticipants = await this.unitOfWork
      .getParticipantRepository()
      .findManyParticipants({ meetingId: meeting.id });

    const listParticipantsAwait = listParticipants.map(async (p) => {
      const participantDto = ParticipantUsecaseDto.newFromEntity(p);
      const is = await this.webRTCService
        .getParticipant({
          roomId: p.meetingId,
          participantId: p.id,
          roomType: RoomType.MEETING,
        })
        .catch(() => null);
      if (!is) return { ...participantDto, isOnline: false };
      else return { ...participantDto, isOnline: true };
    });

    return await Promise.all(listParticipantsAwait);
  }

  async deleteParticipantById(id: string): Promise<ParticipantUsecaseDto> {
    throw new Error("Method not implemented.");
  }

  async getParticipantByUserIdAndMeetingId(
    userId: string,
    meetingId: string,
  ): Promise<ParticipantUsecaseDto & { isOnline: boolean }> {
    const participant = await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({ userId, meetingId });
    if (!participant) throw new NotFoundException("Participant not found!");

    const participantOnline = await this.webRTCService
      .getParticipant({
        roomId: participant.meetingId,
        participantId: participant.id,
        roomType: RoomType.MEETING,
      })
      .catch(() => null);

    const isOnline = Boolean(participantOnline);
    return { ...ParticipantUsecaseDto.newFromEntity(participant), isOnline };
  }

  async getAccessToken(payload: {
    meetingId: string;
    participantName: string;
  }): Promise<GetAccessTokenDto> {
    const userId = this.requestWithUser.user.id;
    const user = await this.userService.getUserById(userId);
    if (!userId) throw new AppException(AppErrors.ENTITY_NOT_FOUND_ERROR);
    const { meetingId, participantName } = payload;

    const meeting = await this.meetingService.getMeetingById(meetingId);
    if (meeting.endTime && meeting.endTime < new Date())
      throw new BadRequestException(`Meeting has ended!`);

    // Get Or Create Participant
    const participant = await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({ userId, meetingId: meeting.id })
      .then(async (p) => {
        if (p) return p;
        else
          return await Participant.new({
            meetingId: meeting.id,
            name: participantName,
            role: ParticipantRole.PARTICIPANT,
            userId,
          });
      });
    //Overwrite name
    participant.edit({ name: participantName });

    const participantDto = ParticipantUsecaseDto.newFromEntity(participant);
    const tokens = await this.createAccessToken(meeting, participantDto);
    return { participant: participantDto, tokens };
  }

  async sendMessage(payload: ParticipantSendMessagePort): Promise<void> {
    const { roomId, roomType, content, senderId } = payload;
    const message: Message = { roomId, roomType, content, senderId };

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

  async respondJoinRequest(
    responderId: string,
    meetingId: string,
    participantIds: string[],
    status: RespondJoinStatus,
  ): Promise<void> {
    await this.unitOfWork.runInTransaction(async () => {
      // Just for HOST
      const meeting = await this.meetingService.getMeetingById(meetingId);
      const responder = await this.getParticipantById(responderId);
      if (responder.role !== ParticipantRole.HOST)
        throw new ForbiddenException("Not host of meeting"); //TODO: check all Unauthorized

      const sendPromise = participantIds.map(async (participantId) => {
        const participant = await this.getParticipantById(participantId)
          .then((res) => (res.meetingId === meeting.id ? res : null))
          .catch(async () => {
            return await this.webRTCService
              .getParticipant({
                roomId: meeting.id,
                roomType: RoomType.WAITING,
                participantId,
              })
              .then((p) => ({ ...p, isOnline: true }))
              .catch(() => null);
          });
        if (!participant) return;

        if (status === RespondJoinStatus.REJECTED) {
          return await this.webRTCService.sendDataMessage({
            sendto: {
              roomId: meeting.id,
              roomType: RoomType.WAITING,
              participantIds: [participantId],
            },
            action: createSendDataMessageAction(
              SendMessageActionEnum.ParticipantRequestJoin,
              { status },
            ),
          });
        } else if (status === RespondJoinStatus.ACCEPTED) {
          if (participant.userId) {
            const p = await Participant.new({ ...participant });
            await this.unitOfWork.getParticipantRepository().addParticipant(p);
          }
          const permissions: VideoGrant = this.getPermissions(RoomType.MEETING);
          const metadata: AccessTokenMetadata = Object.assign(participant, {
            room: { id: meeting.id, type: RoomType.MEETING },
          });
          const _token = await this.webRTCService.createToken({
            permissions,
            metadata,
          });

          const action = createSendDataMessageAction(
            SendMessageActionEnum.ParticipantRequestJoin,
            { status, token: _token },
          );

          const adapter: SendDataMessagePort = {
            sendto: {
              roomId: meeting.id,
              roomType: RoomType.WAITING,
              participantIds: [participantId],
            },
            action,
          };
          await this.webRTCService.sendDataMessage(adapter);
        }
      });

      return await Promise.all(sendPromise);
    });
  }

  async updateMyMeeting(
    updater: HttpUserPayload,
    updateId: string,
    payload: UpdateMeetingPort,
  ): Promise<void> {
    const participant = await this.getParticipantByUserIdAndMeetingId(
      updater.id,
      updateId,
    );
    const isHost = participant.role === ParticipantRole.HOST;
    if (!isHost) throw new ForbiddenException("Not host of meeting");
    await this.meetingService.updateMeeting(updateId, payload);

    const meeting = await this.unitOfWork
      .getMeetingRepository()
      .findMeeting({ id: updateId });
    if (!meeting) throw new NotFoundException("Meeting not found!");

    await meeting.edit(payload);
    await this.unitOfWork
      .getMeetingRepository()
      .updateMeeting({ id: meeting.id }, meeting);
  }

  // Private methods
  private validateMeetingTime(meeting: Meeting) {
    if (meeting.endTime && meeting.endTime < new Date()) {
      throw new BadRequestException(`Meeting has ended!`);
    }
  }

  private prepareParticipantDto(
    participant: Participant,
    customName: string,
  ): ParticipantUsecaseDto {
    const participantDto = ParticipantUsecaseDto.newFromEntity(participant);
    participantDto.name = customName; // overwrite name
    return participantDto;
  }

  // private async getOrCreateParticipant(
  //   userId: string,
  //   meeting: MeetingUsecaseDto,
  // ): Promise<ParticipantUsecaseDto> {
  //   const participant = await this.findParticipant(userId, meeting.id);
  //   if (participant) return participant;
  //   return await this.createParticipant();
  // }

  private async findParticipant(
    userId: string,
    meetingId: string,
  ): Promise<Participant | null> {
    return await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({ userId, meetingId });
  }

  // private async createParticipantEntity(
  //   getter: HttpParticipantPayload,
  // ): Promise<Participant> {
  //   let participant: Participant;
  //   if (!getter.userId) {
  //     // This is Anonymous Participant
  //     participant = await Participant.new({
  //       meetingId: getter.meetingId,
  //       name: "Anonymous",
  //       role: ParticipantRole.PARTICIPANT,
  //     });
  //   } else {
  //     const currentUser = await this.userService.getUserById(getter.userId);
  //     const fullName = currentUser.firstName ?? "" + " " + currentUser.lastName;
  //     participant = await Participant.new({
  //       meetingId: getter.userId,
  //       name: fullName.trim(),
  //       role: ParticipantRole.PARTICIPANT,
  //       userId: currentUser.id,
  //     });
  //   }

  //   return participant;
  // }

  private async createAccessToken(
    meeting: MeetingUsecaseDto,
    participant: ParticipantUsecaseDto,
  ) {
    if (participant.role === ParticipantRole.HOST) {
      const tokens: CreateTokenDto[] = [];
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
    const tokens: CreateTokenDto[] = [];
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
