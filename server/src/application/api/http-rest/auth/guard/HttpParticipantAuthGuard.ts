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

    const tokenPayload = await this.webRTCService
      .verifyToken(meetingApiToken)
      .catch(() => null);
    if (!tokenPayload) throw new UnauthorizedException();

    let localParticipant: ParticipantUsecaseDTO | null = null;
    localParticipant = await this.webRTCService.getParticipant({
      roomId: tokenPayload.room.id,
      roomType: tokenPayload.room.type,
      participantId: tokenPayload.id,
    });
    if (!localParticipant)
      localParticipant = await this.participantService
        .getParticipant({
          meetingId: tokenPayload.room.id,
          participantId: tokenPayload.id,
        })
        .catch(() => null);
    if (!localParticipant) throw new UnauthorizedException();

    request["participant"] = tokenPayload; // Token includes participant info and room information
    return true;
  }
}
