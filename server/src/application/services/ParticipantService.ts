import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitService";
import { ParticipantUsecaseDto } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDto";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Participant } from "@core/domain/participant/entity/Participant";
import { MeetingService } from "./MeetingService";
import {
  AccessPermissionsStatus,
  ParticipantAccessTokenDTO,
  ParticipantUsecase,
} from "@core/domain/participant/usecase/ParticipantUsecase";
import {
  SendMessageActionEnum,
  createSendDataMessageAction,
} from "@infrastructure/adapter/webrtc/Actions";
// import { UserService } from "./UserService";
import { MeetingUsecase } from "@core/domain/meeting/usecase/MeetingUsecase";
import { ParticipantSendMessageDTO } from "@core/domain/participant/usecase/dto/ParticipantSendMessageDTO";
import { CustomJwtService } from "./JwtService";
import { MeetingType } from "@core/common/enums/MeetingEnums";
import { HttpParticipantPayload } from "@application/api/http-rest/auth/type/HttpParticipantTypes";
import { RoomService } from "./RoomService";
import { RoomType } from "@core/common/enums/RoomEnum";
import { HttpUserPayload } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { UpdateMeetingDTO } from "@core/domain/meeting/usecase/dto/UpdateMeetingDTO";

@Injectable()
export class ParticipantService implements ParticipantUsecase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    @Inject(MeetingService)
    private readonly meetingService: MeetingUsecase,
    private readonly webRTCService: WebRTCLivekitService,
    private readonly jwtService: CustomJwtService,
    private readonly roomService: RoomService,
  ) {}

  async createParticipant(dto: {
    name: string;
    userId?: string;
    meetingId: string;
    role?: ParticipantRole;
  }): Promise<ParticipantUsecaseDto> {
    const part = await Participant.new(dto);
    await this.unitOfWork.getParticipantRepository().addParticipant(part);
    return ParticipantUsecaseDto.newFromEntity(part);
  }

  async getParticipantById(id: string): Promise<ParticipantUsecaseDto> {
    const part = await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({ id });
    if (!part) throw new NotFoundException("Participant not found!");
    return ParticipantUsecaseDto.newFromEntity(part);
  }

  async getParticipantInRoomById(
    roomId: string,
    partId: string,
  ): Promise<ParticipantUsecaseDto> {
    return await this.webRTCService
      .getParticipantInRoomById(roomId, partId)
      .then((p) => ParticipantUsecaseDto.newFromEntity(p));
  }

  async deleteParticipantInRoomById(
    roomId: string,
    partId: string,
  ): Promise<ParticipantUsecaseDto> {
    const part = await this.getParticipantInRoomById(roomId, partId);
    await this.webRTCService.deleteParticipantInRoomById(roomId, partId);
    return part;
  }

  async sendMessage(dto: ParticipantSendMessageDTO): Promise<void> {
    const { senderId, sendTo, content } = dto;
    const { roomId, partIds } = sendTo;

    const action = createSendDataMessageAction(
      SendMessageActionEnum.ParticipantSendMessage,
      { senderId, content },
    );
    await this.webRTCService.sendDataMessage({
      sendTo: { roomId, partIds },
      action,
    });
  }

  async getParticipantAccessToken(
    meetingId: string,
    name: string,
    userId: string,
  ): Promise<ParticipantAccessTokenDTO> {
    let status: AccessPermissionsStatus = "wait";

    await this.meetingService.getMeetingById(meetingId).then((m) => {
      if (m.type === MeetingType.PUBLIC) status = "accept";
    });
    const part = await this.getMeetingParticipantByUserId(meetingId, userId)
      .then((exitPart) => {
        status = "accept";
        return exitPart;
      })
      .catch(() =>
        Participant.new({ name, userId, meetingId }).then((p) =>
          ParticipantUsecaseDto.newFromEntity(p),
        ),
      );
    const { token } = this.jwtService.generateParticipantAccessToken({
      id: part.id,
      meetingId: part.meetingId,
      role: part.role,
      userId: part.userId,
      name: part.name,
    });
    return { token, status, participant: part };
  }

  async getRoomAccessToken(
    roomId: string,
    part: HttpParticipantPayload,
  ): Promise<{ token: string }> {
    const room = await this.roomService.getRoomById(roomId);
    const token = await this.webRTCService.createParticipantAccessToken({
      roomId: room.id,
      roomName: room.name,
      roomType: room.type,
      participant: {
        id: part.id,
        name: part.name,
        meetingId: part.meetingId,
        userId: part.userId ?? null,
        role: part.role,
        avatar: "", //TODO: fix
      },
    });
    return { token };
  }

  async respondJoinRequest(
    responder: HttpParticipantPayload,
    meetingId: string,
    partIds: string[],
    status: AccessPermissionsStatus,
  ): Promise<void> {
    const meeting = await this.meetingService.getMeetingById(meetingId);
    if (meeting.id !== responder.meetingId)
      throw new ForbiddenException("Not host of meeting");
    if (responder.role !== ParticipantRole.HOST)
      throw new ForbiddenException("Not host of meeting");

    const waitingRoom = await this.meetingService.getMeetingRoom(
      meeting.id,
      RoomType.WAITING,
    );

    if (status === "accept")
      for (const partId of partIds) {
        const part = await this.getParticipantInRoomById(
          waitingRoom.id,
          partId,
        ).catch(() => null);
        if (!part) continue;
        await this.createParticipant(part).catch(() => null);
      }

    await this.webRTCService.sendDataMessage({
      sendTo: { roomId: waitingRoom.id, partIds },
      action: createSendDataMessageAction(
        SendMessageActionEnum.ParticipantRequestJoin,
        { status },
      ),
    });
  }

  async updateMeeting(
    updater: HttpUserPayload,
    updateId: string,
    payload: UpdateMeetingDTO,
  ) {
    const participant = await this.getMeetingParticipantByUserId(
      updateId,
      updater.id,
    );
    const isHost = participant.role === ParticipantRole.HOST;
    if (!isHost) throw new ForbiddenException("Not host of meeting");
    if (
      payload.endDate &&
      new Date(payload.endDate).getTime() < new Date().getTime()
    )
      throw new BadRequestException(`Meeting has ended!`);
    await this.meetingService.updateMeeting(updateId, payload);
  }

  // Private methods
  private async getMeetingParticipantByUserId(
    meetingId: string,
    userId: string,
  ): Promise<ParticipantUsecaseDto> {
    const participant = await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({ userId, meetingId });
    if (!participant) throw new NotFoundException("Participant not found!");
    return ParticipantUsecaseDto.newFromEntity(participant);
  }
}
