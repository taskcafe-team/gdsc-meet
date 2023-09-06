import { PassportModule } from "@nestjs/passport";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

import { AuthController } from "@application/api/http-rest/controller/AuthController";
import { HttpAuthService } from "@application/api/http-rest/auth/HttpAuthService";
import { HttpLocalStrategy } from "@application/api/http-rest/auth/passport/HttpLocalStrategy";
import { HttpGoogleStrategy } from "@application/api/http-rest/auth/passport/HttpGoogleStrategy";
import { HttpJwtStrategy } from "@application/api/http-rest/auth/passport/HttpJwtStrategy";

import { InfrastructureModule } from "./InfrastructureModule";
import { UserModule } from "./UserModule";

@Module({
  controllers: [AuthController],
  imports: [InfrastructureModule, UserModule, PassportModule, JwtModule],
  providers: [
    ConfigService,
    HttpAuthService,
    HttpJwtStrategy,
    HttpLocalStrategy,
    HttpGoogleStrategy,
  ],
})
export class AuthModule {}
