import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

type JwtVerifyDto = {
  iat: number; // issued at
  exp: number; // expiration time
};

type UserJwtDto = { userId: string };

type JwtDto = {
  token: string;
  expiresIn: string;
};

export interface JwtUsecase {
  // generateToken(userId: string): Promise<string>;
  // verifyToken(token: string): Promise<string>;

  generateUserAccessToken(payload: UserJwtDto): JwtDto;
  verifyUserAccessToken(token: string): UserJwtDto & JwtVerifyDto;

  generateUserRefreshToken(payload: UserJwtDto): JwtDto;
  verifyUserRefreshToken(token: string): UserJwtDto & JwtVerifyDto;

  generateEmailVerificationToken(payload: UserJwtDto): JwtDto;
  verifyEmailVerificationToken(token: string): UserJwtDto & JwtVerifyDto;
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
    configService: ConfigService<EnvironmentVariablesConfig, true>,
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

  generateUserAccessToken(payload: UserJwtDto): JwtDto {
    const secret = this.userAccessTokenSecret;
    const expiresIn = this.userAccessTokenTtl + "m";
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    return { token, expiresIn };
  }

  verifyUserAccessToken(token: string): UserJwtDto & JwtVerifyDto {
    const secret = this.userAccessTokenSecret;
    return this.jwtService.verify(token, { secret });
  }

  generateUserRefreshToken(payload: UserJwtDto): JwtDto {
    const secret = this.userRefreshTokenSecret;
    const expiresIn = this.userRefreshTokenTtl + "m";
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    return { token, expiresIn };
  }

  verifyUserRefreshToken(token: string): UserJwtDto & JwtVerifyDto {
    const secret = this.userAccessTokenSecret;
    return this.jwtService.verify(token, { secret });
  }

  generateEmailVerificationToken(payload: UserJwtDto): JwtDto {
    const secret = this.emailVerificationTokenSecret;
    const expiresIn = this.emailVerificationTokenTtl + "m";
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    return { token, expiresIn };
  }

  verifyEmailVerificationToken(token: string): UserJwtDto & JwtVerifyDto {
    const secret = this.emailVerificationTokenSecret;
    return this.jwtService.verify(token, { secret });
  }
}
