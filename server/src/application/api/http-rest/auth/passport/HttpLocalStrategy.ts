import { HttpAuthService } from "@application/api/http-rest/auth/HttpAuthService";
import { HttpUserPayload } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ModuleRef } from "@nestjs/core";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";

@Injectable()
export class HttpLocalStrategy
  extends PassportStrategy(Strategy, "local")
  implements OnModuleInit
{
  private authService: HttpAuthService;
  constructor(
    configService: ConfigService<EnvironmentVariablesConfig>,
    private readonly moduleRef: ModuleRef,
  ) {
    const usernameField = configService.get("API_LOGIN_USERNAME_FIELD");
    const passwordField = configService.get("API_LOGIN_PASSWORD_FIELD");
    super({ usernameField, passwordField });
  }

  async onModuleInit() {
    this.authService = await this.moduleRef.resolve(HttpAuthService);
  }

  public async validate(
    email: string,
    password: string,
  ): Promise<HttpUserPayload> {
    const user = await this.authService.getUser({ email });
    if (!user || !(await user.comparePassword(password)))
      throw new UnauthorizedException("Email or password is invalid");

    return { id: user.id, role: user.role, isValid: user.isValid };
  }
}
