import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

import { AuthController } from "@application/api/http-rest/controller/AuthController";
import { HttpAuthService } from "@application/api/http-rest/auth/HttpAuthService";
import { HttpLocalStrategy } from "@application/api/http-rest/auth/passport/HttpLocalStrategy";
import { HttpGoogleStrategy } from "@application/api/http-rest/auth/passport/HttpGoogleStrategy";
import { HttpJwtStrategy } from "@application/api/http-rest/auth/passport/HttpJwtStrategy";

import { InfrastructureModule } from "./InfrastructureModule";
import { UserModule } from "./UserModule";

@Module({
  controllers: [AuthController],
  imports: [
    InfrastructureModule,
    UserModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariablesConfig>,
      ) => ({ secret: configService.get("API_ACCESS_TOKEN_SECRET") }),
    }),
  ],
  providers: [
    HttpAuthService,
    HttpJwtStrategy,
    HttpLocalStrategy,
    HttpGoogleStrategy,
  ],
})
export class AuthModule {}
