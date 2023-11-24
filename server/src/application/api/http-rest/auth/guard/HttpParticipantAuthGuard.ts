import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { ParticipantUsecaseDto } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDto";
import { ParticipantService } from "@application/services/ParticipantService";
import { HttpParticipantPayload } from "../type/HttpParticipantTypes";

@Injectable()
export class HttpParticipantAuthGuard implements CanActivate {
  constructor(
    private readonly webRTCService: WebRTCLivekitService,
    private readonly participantService: ParticipantService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const meetingApiToken = request.headers["meeting-api-token"];

    const verifed = await this.webRTCService
      .verifyToken(meetingApiToken)
      .catch(() => null);
    if (!verifed) throw new UnauthorizedException();

    let localParticipant: ParticipantUsecaseDto | null = null;
    localParticipant = await this.webRTCService.getParticipant({
      roomId: verifed.room.id,
      roomType: verifed.room.type,
      participantId: verifed.id,
    });
    if (!localParticipant)
      localParticipant = await this.participantService.getParticipantById(
        verifed.id,
      );
    if (!localParticipant) throw new UnauthorizedException();

    const httpParticipant: HttpParticipantPayload = {
      id: localParticipant.id,
      meetingId: localParticipant.meetingId,
      role: localParticipant.role,
      userId: localParticipant.userId,
    };

    request["participant"] = httpParticipant; //TODO: find all ParticipantMetadata to check
    return true;
  }
}
