import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { MeetingService } from "../meeting/MeetingService";
import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import { ParticipantUsecaseDTO } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDTO";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import {
  SendMessageActionEnum,
  createSendDataMessageAction,
} from "@infrastructure/adapter/webrtc/Actions";
import { SendDataMessagePort } from "@infrastructure/adapter/webrtc/Types";
import { HttpResponseWithOptionalUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { REQUEST } from "@nestjs/core";

@Injectable()
export default class ParticipantService {
  constructor(
    @Inject(REQUEST)
    private readonly requestWithOptionalUser: HttpResponseWithOptionalUser,
    private readonly unitOfWork: UnitOfWork,
    private readonly meetingService: MeetingService,
    private readonly webRTCService: WebRTCLivekitService,
  ) {}

  public async getParticipant(port: {
    meetingId: string;
    participantId: string;
  }): Promise<ParticipantUsecaseDTO & { isOnline: boolean }> {
    const { meetingId, participantId } = port;
    const meeting = await this.meetingService.getMeeting({ meetingId });
    const participantRemote = await this.webRTCService
      .getParticipant(meeting.id, participantId)
      .catch(() => null);
    const participantLocal = await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({ id: participantId });
    if (!participantLocal) throw new NotFoundException("Participant not found");

    const dto = ParticipantUsecaseDTO.newFromEntity(participantLocal);

    return { ...dto, isOnline: participantRemote ? true : false };
  }

  public async getParticipants(meetingId: string) {
    const meeting = await this.meetingService.getMeeting({ meetingId });
    const remoteParticipants =
      await this.webRTCService._roomServiceClient.listParticipants(meeting.id);
    return remoteParticipants.map<ParticipantUsecaseDTO>(({ metadata }) =>
      JSON.parse(metadata),
    );
  }

  public async requestJoinMeeting(port: { token: string }) {
    const verifyToken = this.webRTCService.verifyToken(port.token);
    if (!verifyToken) throw new UnauthorizedException("Token invalid!");
    if (!verifyToken.metadata)
      throw new InternalServerErrorException("request join meeting error");
    const participantDTO = verifyToken.metadata;

    // Get host is online
    const hostDomain = await this.unitOfWork
      .getParticipantRepository()
      .findParticipant({
        meetingId: participantDTO.meetingId,
        role: ParticipantRole.HOST,
      });
    if (!hostDomain) throw new NotFoundException("Host is not online!");
    const hostIsOnline = await this.webRTCService
      .getParticipant(hostDomain.meetingId, hostDomain.getId())
      .catch(() => undefined);
    if (!hostIsOnline) throw new NotFoundException("Host is not online!");

    // Send message request join meeting to host
    const action = createSendDataMessageAction(
      SendMessageActionEnum.ParticipantRequestJoin,
      { participantId: participantDTO.id },
    );

    const adapter: SendDataMessagePort = {
      sendto: {
        meetingId: hostDomain.meetingId,
        participantIds: [hostDomain.getId()],
      },
      action,
    };

    await this.webRTCService.sendDataMessage(adapter);
  }

  public async sendMessage(port: {
    sendto: { meetingId: string; participantIds?: string[] };
    message: string;
  }) {
    const roomchatType: "WAITING" | "MAIN" = "MAIN";
    const currentUserId = this.requestWithOptionalUser.user?.id;
    if (!currentUserId) throw new UnauthorizedException("Unauthorized");

    const { sendto, message } = port;
    const { meetingId, participantIds } = sendto;

    let sendby: string | null = null;

    if (roomchatType == "MAIN")
      sendby = await this.unitOfWork
        .getParticipantRepository()
        .findParticipant({ userId: currentUserId, meetingId })
        .then((p) => p?.getId() || null)
        .catch(() => null);
    else {
    }
    if (!sendby) throw new UnauthorizedException("Unauthorized");

    const action = createSendDataMessageAction(
      SendMessageActionEnum.ParticipantSendMessage,
      { message, sendby },
    );

    const adapter: SendDataMessagePort = {
      sendto: { meetingId, participantIds },
      action,
    };

    await this.webRTCService.sendDataMessage(adapter);
  }
}
