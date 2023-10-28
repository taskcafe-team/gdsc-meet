import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-facebook";
import { ConfigService } from "@nestjs/config";
import { Profile } from "passport";

import { User } from "@core/domain/user/entity/User";
import { UserRole } from "@core/common/enums/UserEnums";
import { ProviderNameEnums } from "@core/common/enums/ProviderNameEnums";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { HttpUserPayload } from "../type/HttpAuthTypes";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

@Injectable()
export class HttpFacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(
    configService: ConfigService<EnvironmentVariablesConfig>,
    private readonly unitOfWork: UnitOfWork,
  ) {
    super({
      clientID: configService.get("FACEBOOK_CLIENT_ID"),
      clientSecret: configService.get("FACEBOOK_CLIENT_SECRET"),
      callbackURL: configService.get("FACEBOOK_CALLBACK_URL"),
      profileFields: ["id", "displayName", "email", "photos"],
    });
  }

  public async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err?: string | Error | null, user?: Express.User, info?: any) => void,
  ) {
    const email = profile.emails ? profile.emails[0].value : "";
    const firstName = profile.name ? profile.name.givenName : "";
    const lastName = profile.name ? profile.name.familyName : "";
    const photo = profile.photos ? profile.photos[0].value : null;

    const userExit = await this.unitOfWork
      .getUserRepository()
      .findUser({ email });

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
      providerName: ProviderNameEnums.FACEBOOK,
      providerId: profile.id,
      isValid: true,
      role: UserRole.USER,
      avatar: photo,
    });

    await this.unitOfWork.getUserRepository().addUser(newUser);
    const userPayload: HttpUserPayload = {
      id: newUser.getId(),
      role: newUser.role,
      isValid: newUser.isValid,
    };
    done(null, userPayload);
    return userPayload;
  }
}
