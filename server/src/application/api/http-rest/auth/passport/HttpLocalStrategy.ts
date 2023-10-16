import { HttpAuthService } from "@application/api/http-rest/auth/HttpAuthService";
import { HttpUserPayload } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { Code } from "@core/common/code/Code";
import { Exception } from "@core/common/exception/Exception";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { Injectable, OnModuleInit } from "@nestjs/common";
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
    super({
      usernameField: configService.get("API_LOGIN_USERNAME_FIELD"),
      passwordField: configService.get("API_LOGIN_PASSWORD_FIELD"),
    });
  }

  async onModuleInit() {
    this.authService = await this.moduleRef.resolve(HttpAuthService);
  }

  public async validate(
    email: string,
    password: string,
  ): Promise<HttpUserPayload> {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw Exception.new({ code: Code.WRONG_CREDENTIALS_ERROR });

    return user;
  }
}
