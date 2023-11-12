import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { ParticipantUsecaseDTO } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDTO";
import ParticipantService from "@core/services/participant/ParticipantService";

@Injectable()
export class HttpParticipantAuthGuard implements CanActivate {
  constructor(
    private readonly webRTCService: WebRTCLivekitService,
    private readonly participantService: ParticipantService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const meetingApiToken = request.headers["meeting-api-token"];

    const verifedToken = await this.webRTCService
      .verifyToken(meetingApiToken)
      .catch(() => null);
    if (!verifedToken) throw new UnauthorizedException();
    const meetingId = verifedToken.meetingId;
    const participantId = verifedToken.id;

    let localParticipant: ParticipantUsecaseDTO | null = null;
    localParticipant = await this.webRTCService.getParticipant(
      meetingId,
      participantId,
    );
    if (!localParticipant)
      localParticipant = await this.participantService
        .getParticipant({
          meetingId,
          participantId,
        })
        .catch(() => null);
    if (!localParticipant) throw new UnauthorizedException();
    request["participant"] = localParticipant;
    return true;
  }
}
