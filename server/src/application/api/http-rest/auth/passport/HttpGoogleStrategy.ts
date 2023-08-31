import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { Profile } from "passport";

import { User } from "@core/domain/user/entity/User";
import { UserRole } from "@core/common/enums/UserEnums";
import { ProviderNameEnums } from "@core/common/enums/ProviderNameEnums";
import { IUnitOfWork } from "@core/common/persistence/IUnitOfWork";
import { HttpUserPayload } from "../type/HttpAuthTypes";
import { CommonDITokens } from "@core/common/DIToken/CommonDITokens";
import { Inject } from "@nestjs/common";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

export class HttpGoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    configService: ConfigService<EnvironmentVariablesConfig>,
    @Inject(CommonDITokens.UnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
  ) {
    super({
      clientID: configService.get("GOOGLE_CLIENT_ID"),
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.get("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
    });
  }

  public async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<HttpUserPayload> {
    const email = profile.emails ? profile.emails[0].value : "";
    const firstName = profile.name ? profile.name.familyName : "";
    const lastName = profile.name ? profile.name.givenName : "";
    const photo = profile.photos ? profile.photos[0].value : null;

    const userExit = await this.unitOfWork
      .getUserRepository()
      .findUser({ email });

    if (userExit) {
      const userPayload: HttpUserPayload = {
        id: userExit.getId(),
        role: userExit.role,
      };

      done(null, userPayload);
      return userPayload;
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

    await this.unitOfWork.getUserRepository().addUser(newUser);
    const userPayload: HttpUserPayload = {
      id: newUser.getId(),
      role: newUser.role,
    };
    done(null, userPayload);
    return userPayload;
  }
}
