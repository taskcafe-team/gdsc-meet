import { Injectable, OnModuleInit } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { Profile } from "passport";

import { User } from "@core/domain/user/entity/User";
import { UserRole } from "@core/common/enums/UserEnums";
import { ProviderNameEnums } from "@core/common/enums/ProviderNameEnums";
import { HttpUserPayload } from "../type/HttpAuthTypes";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { HttpAuthService } from "../HttpAuthService";
import { ModuleRef } from "@nestjs/core";

@Injectable()
export class HttpGoogleStrategy
  extends PassportStrategy(Strategy, "google")
  implements OnModuleInit
{
  private authService: HttpAuthService;

  constructor(
    configService: ConfigService<EnvironmentVariablesConfig>,
    private readonly moduleRef: ModuleRef,
  ) {
    super({
      clientID: configService.get("GOOGLE_CLIENT_ID"),
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.get("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
    });
  }

  async onModuleInit() {
    this.authService = await this.moduleRef.resolve(HttpAuthService);
  }

  public async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails ? profile.emails[0].value : "";
    const firstName = profile.name ? profile.name.familyName : "";
    const lastName = profile.name ? profile.name.givenName : "";
    const photo = profile.photos ? profile.photos[0].value : null;

    const userExit = await this.authService.getUser({ email });

    if (userExit) {
      const userPayload: HttpUserPayload = {
        id: userExit.getId(),
        role: userExit.role,
        isValid: userExit.isValid,
      };

      done(null, userPayload);
    }

    const newUser: User = await User.new({
      firstName: firstName,
      lastName: lastName,
      email: email,
      providerName: ProviderNameEnums.GOOGLE,
      providerId: profile.id,
      isValid: true,
      role: UserRole.USER,
      avatar: photo,
    });

    await this.authService.registerWithGoogle(newUser);
    const userPayload: HttpUserPayload = {
      id: newUser.getId(),
      role: newUser.role,
      isValid: newUser.isValid,
    };
    done(null, userPayload);
    return userPayload;
  }
}
