import { HttpUserJwtPayload } from "@application/api/http-rest/auth/type/HttpAuthTypes";
import { HttpParticipantPayload } from "@application/api/http-rest/auth/type/HttpParticipantTypes";
import { AppConfig } from "@infrastructure/config/AppConfig";
import { MailServiceConfig } from "@infrastructure/config/MailServiceConfig";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

export type JwtVerifyDto = {
  iat: number; // issued at
  exp: number; // expiration time
};

export type JwtDto = {
  token: string;
  expiresIn: string;
};

export interface JwtUsecase {
  generateUserAccessToken(payload: HttpUserJwtPayload): JwtDto;
  verifyUserAccessToken(token: string): HttpUserJwtPayload & JwtVerifyDto;

  generateUserRefreshToken(payload: HttpUserJwtPayload): JwtDto;
  verifyUserRefreshToken(token: string): HttpUserJwtPayload & JwtVerifyDto;

  generateEmailVerificationToken(payload: HttpUserJwtPayload): JwtDto;
  verifyEmailVerificationToken(
    token: string,
  ): HttpUserJwtPayload & JwtVerifyDto;

  generateParticipantAccessToken(payload: HttpParticipantPayload): JwtDto;
  verifyParticipantAccessToken(
    token: string,
  ): HttpParticipantPayload & JwtVerifyDto;
}

@Injectable()
export class CustomJwtService implements JwtUsecase {
  // private readonly baseSercet: string;

  private readonly userAccessTokenSecret: string;
  private readonly userAccessTokenTtl: string; // in minutes

  private readonly userRefreshTokenSecret: string;
  private readonly userRefreshTokenTtl: string; // in minutes

  private readonly emailVerificationTokenSecret: string;
  private readonly emailVerificationTokenTtl: string; // in minutes

  constructor(
    configService: ConfigService<AppConfig & MailServiceConfig, true>,
    private readonly jwtService: JwtService,
  ) {
    // User credentials
    this.userAccessTokenSecret = configService.get("API_ACCESS_TOKEN_SECRET");
    this.userAccessTokenTtl = configService.get(
      "API_ACCESS_TOKEN_TTL_IN_MINUTES",
    );

    this.userRefreshTokenSecret = configService.get("API_REFRESH_TOKEN_SECRET");
    this.userRefreshTokenTtl = configService.get(
      "API_REFRESH_TOKEN_TTL_IN_MINUTES",
    );

    this.emailVerificationTokenSecret = configService.get(
      "EMAIL_VERIFICATION_TOKEN_SECRET",
    );
    this.emailVerificationTokenTtl = configService.get(
      "EMAIL_VERIFICATION_TOKEN_SECRET_TTL_IN_MINUTES",
    );
  }

  generateUserAccessToken(payload: HttpUserJwtPayload): JwtDto {
    const secret = this.userAccessTokenSecret;
    const expiresIn = this.userAccessTokenTtl + "m";
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    return { token, expiresIn };
  }

  verifyUserAccessToken(token: string): HttpUserJwtPayload & JwtVerifyDto {
    const secret = this.userAccessTokenSecret;
    return this.jwtService.verify(token, { secret });
  }

  generateUserRefreshToken(payload: HttpUserJwtPayload): JwtDto {
    const secret = this.userRefreshTokenSecret;
    const expiresIn = this.userRefreshTokenTtl + "m";
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    return { token, expiresIn };
  }

  verifyUserRefreshToken(token: string): HttpUserJwtPayload & JwtVerifyDto {
    const secret = this.userAccessTokenSecret;
    return this.jwtService.verify(token, { secret });
  }

  generateEmailVerificationToken(payload: HttpUserJwtPayload): JwtDto {
    const secret = this.emailVerificationTokenSecret;
    const expiresIn = this.emailVerificationTokenTtl + "m";
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    return { token, expiresIn };
  }

  verifyEmailVerificationToken(
    token: string,
  ): HttpUserJwtPayload & JwtVerifyDto {
    const secret = this.emailVerificationTokenSecret;
    return this.jwtService.verify(token, { secret });
  }

  generateParticipantAccessToken(payload: HttpParticipantPayload) {
    const secret = this.userAccessTokenSecret;
    const expiresIn = this.userAccessTokenTtl + "m";
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    return { token, expiresIn };
  }
  verifyParticipantAccessToken(
    token: string,
  ): HttpParticipantPayload & JwtVerifyDto {
    const secret = this.userAccessTokenSecret;
    return this.jwtService.verify(token, { secret });
  }
}
