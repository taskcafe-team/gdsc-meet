import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { HttpAuthService } from "@application/api/http-rest/auth/HttpAuthService";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import {
  HttpJwtPayload,
  HttpUserPayload,
} from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { Exception } from "@core/common/exception/Exception";
import { Code } from "@core/common/code/Code";
import { Inject, Injectable } from "@nestjs/common";
import { CommonDITokens } from "@core/common/DIToken/CommonDITokens";
import { IUnitOfWork } from "@core/common/persistence/IUnitOfWork";

@Injectable()
export class HttpJwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    configService: ConfigService<EnvironmentVariablesConfig, true>,
    @Inject(CommonDITokens.UnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader(
        configService.get("API_ACCESS_TOKEN_HEADER"),
      ),
      ignoreExpiration: false,
      secretOrKey: configService.get("API_ACCESS_TOKEN_SECRET"),
    });
  }

  public async validate(payload: HttpJwtPayload): Promise<HttpUserPayload> {
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.id });

    if (!user) throw Exception.new({ code: Code.UNAUTHORIZED_ERROR });

    return { id: user.getId(), role: user.role };
  }
}
