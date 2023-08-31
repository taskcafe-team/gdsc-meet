import { HttpAuthService } from "@application/api/http-rest/auth/HttpAuthService";
import { HttpUserPayload } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { Code } from "@core/common/code/Code";
import { Exception } from "@core/common/exception/Exception";
import { CoreAssert } from "@core/common/util/assert/CoreAssert";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";

@Injectable()
export class HttpLocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(
    private readonly authService: HttpAuthService,
    configService: ConfigService<EnvironmentVariablesConfig>,
  ) {
    super({
      usernameField: configService.get("API_LOGIN_USERNAME_FIELD"),
      passwordField: configService.get("API_LOGIN_PASSWORD_FIELD"),
    });
  }

  public async validate(
    email: string,
    password: string,
  ): Promise<HttpUserPayload> {
    const user: HttpUserPayload = CoreAssert.notEmpty(
      await this.authService.validateUser(email, password),
      Exception.new({ code: Code.WRONG_CREDENTIALS_ERROR }),
    );

    return user;
  }
}
