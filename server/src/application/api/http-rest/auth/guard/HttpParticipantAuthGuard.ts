import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitService";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { HttpParticipantPayload } from "../type/HttpParticipantTypes";
import { CustomJwtService } from "@application/services/JwtService";

@Injectable()
export class HttpParticipantAuthGuard implements CanActivate {
  constructor(private readonly jwtService: CustomJwtService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers["meeting-api-token"];

    const verifed = this.jwtService.verifyParticipantAccessToken(token);
    const part: HttpParticipantPayload = verifed;
    request["participant"] = part;
    return true;
  }
}
