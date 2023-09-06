import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import {
  HttpJwtPayload,
  HttpUserPayload,
} from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { Exception } from "@core/common/exception/Exception";
import { Code } from "@core/common/code/Code";
import { Injectable } from "@nestjs/common";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";

@Injectable()
export class HttpJwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    configService: ConfigService<EnvironmentVariablesConfig, true>,
    private readonly unitOfWork: UnitOfWork,
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

    return { id: user.getId(), role: user.role, isValid: user.isValid };
  }
}
