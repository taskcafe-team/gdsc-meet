import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class HttpParticipantRoleAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const participantRoles = this.reflector.get<ParticipantRole[]>(
      "participantRoles",
      context.getHandler(),
    );
    const isPassRolesAuth: boolean =
      participantRoles.length > 0
        ? participantRoles.includes(request.participant.role)
        : true;
    if (!isPassRolesAuth) throw new UnauthorizedException("Unauthorized");
    return true;
  }
}
