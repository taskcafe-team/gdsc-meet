import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import {
  HttpJwtPayload,
  HttpUserPayload,
} from "@application/api/http-rest/auth/type/HttpAuthTypes";
import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { HttpAuthService } from "../HttpAuthService";
import { ModuleRef } from "@nestjs/core";

@Injectable()
export class HttpAccessTokenStrategy
  extends PassportStrategy(Strategy, "jwt")
  implements OnModuleInit
{
  private authService: HttpAuthService;

  constructor(
    configService: ConfigService<EnvironmentVariablesConfig, true>,
    private readonly moduleRef: ModuleRef,
  ) {
    const headerKey = configService.get("API_ACCESS_TOKEN_HEADER");
    const secertKey = configService.get("API_ACCESS_TOKEN_SECRET");
    super({
      jwtFromRequest: ExtractJwt.fromHeader(headerKey),
      ignoreExpiration: false,
      secretOrKey: secertKey,
    });
  }

  async onModuleInit() {
    this.authService = await this.moduleRef.resolve(HttpAuthService);
  }

  public async validate(payload: HttpJwtPayload): Promise<HttpUserPayload> {
    const user = await this.authService.getUser({ id: payload.id });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, role: user.role, isValid: user.isValid };
  }
}
