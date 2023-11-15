import { HttpRequestWithUser } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { UserRole } from "@core/common/enums/UserEnums";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class HttpUserRoleAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: UserRole[] =
      this.reflector.get<UserRole[]>("roles", context.getHandler()) || [];
    const request: HttpRequestWithUser = context.switchToHttp().getRequest();

    const canActivate: boolean =
      roles.length > 0 ? roles.includes(request.user.role) : true;

    if (!canActivate) throw new ForbiddenException();
    return canActivate;
  }
}
