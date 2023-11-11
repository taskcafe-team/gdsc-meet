import { HttpRequestWithUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import Code from "@core/common/constants/Code";
import { UserRole } from "@core/common/enums/UserEnums";
import { Exception } from "@core/common/exception/Exception";
import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitManagement";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class HttpParticipantAuthGuard implements CanActivate {
  constructor(private readonly webRTCService: WebRTCLivekitService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // validate meeting permissions
    const meetingApiToken = request.headers["meeting-api-token"];
    const verifedToken = this.webRTCService.verifyToken(meetingApiToken);
    if (!verifedToken) throw new UnauthorizedException();
    return true;
  }
}
