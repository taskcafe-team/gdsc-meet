import { PassportModule } from "@nestjs/passport";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AuthController } from "@application/api/http-rest/controller/AuthController";
import { HttpAuthService } from "@application/api/http-rest/auth/HttpAuthService";
import { HttpLocalStrategy } from "@application/api/http-rest/auth/passport/HttpLocalStrategy";
import { HttpGoogleStrategy } from "@application/api/http-rest/auth/passport/HttpGoogleStrategy";
import { HttpAccessTokenStrategy } from "@application/api/http-rest/auth/passport/HttpAccessTokenStrategy";

import { InfrastructureModule } from "./InfrastructureModule";
import { UserModule } from "./UserModule";

@Module({
  controllers: [AuthController],
  imports: [InfrastructureModule, UserModule, PassportModule],
  providers: [
    ConfigService,
    HttpAuthService,
    HttpAccessTokenStrategy,
    HttpLocalStrategy,
    HttpGoogleStrategy,
  ],
})
export class AuthModule {}
