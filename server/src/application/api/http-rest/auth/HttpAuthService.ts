import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import {
  HttpJwtPayload,
  HttpLoggedInUser,
  HttpUserPayload,
} from "@application/api/http-rest/auth/type/HttpAuthTypes";

import { User } from "@core/domain/user/entity/User";
import { Nullable } from "@core/common/type/CommonTypes";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { MailerService } from "@nestjs-modules/mailer";
import { Exception } from "@core/common/exception/Exception";
import { Code } from "@core/common/code/Code";
import { CreateUserPort } from "@core/domain/user/port/CreateUserPort";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { TokenSecretType } from "@core/common/contants/TokenSecretType";

@Injectable()
export class HttpAuthService {
  constructor(
    private readonly configService: ConfigService<
      EnvironmentVariablesConfig,
      true
    >,
    private readonly unitOfWork: UnitOfWork,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  public async validateUser(
    email: string,
    password: string,
  ): Promise<Nullable<HttpUserPayload>> {
    const user = await this.unitOfWork.getUserRepository().findUser({ email });
    if (!user || !(await user.comparePassword(password))) return null;
    return { id: user.getId(), role: user.role, isValid: user.isValid };
  }

  private async sendVerificationEmail(user: User): Promise<any> {
    if (user.isValid)
      throw Exception.new({
        code: Code.SUCCESS,
        overrideMessage:
          "The account has not been provided with an email address.",
      });

    if (!user.email)
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage:
          "The account has not been provided with an email address.",
      });

    const payload: HttpUserPayload = {
      id: user.getId(),
      role: user.role,
      isValid: user.isValid,
    };
    const tokenSecret = this.configService.get("API_TOKEN_SECRET");
    const expiresIn = "5m";
    const token = this.jwtService.sign(payload, {
      expiresIn: "5m",
      secret: tokenSecret + TokenSecretType.VerificationEmail,
    });

    const confirmEmailURL = this.configService.get("API_CONFIRM_EMAIL_URL");
    const url = `${confirmEmailURL}?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get("EMAIL_AUTH_USER"),
      subject: "Xác thực email",
      text: "welcome",
      html: `<a href="${url}" target="_blank">Xác Thực</a>`,
    });

    return { expiresIn };
  }

  public async login(user: HttpUserPayload): Promise<HttpLoggedInUser> {
    const payload: HttpJwtPayload = { id: user.id };

    const tokenSecret = this.configService.get("API_TOKEN_SECRET");
    const accessToken: string = this.jwtService.sign(payload, {
      secret: tokenSecret + TokenSecretType.AccessToken,
    });

    const refreshToken: string = this.jwtService.sign(payload, {
      secret: tokenSecret + TokenSecretType.RefreshToken,
    });

    return {
      id: user.id,
      accessToken,
      refreshToken,
    };
  }

  public async getAccessToken(refreshToken: string) {
    const tokenSecret = this.configService.get("API_TOKEN_SECRET");
    const httpUser = await this.jwtService.verifyAsync<HttpUserPayload>(
      refreshToken,
      {
        secret: tokenSecret + TokenSecretType.AccessToken,
      },
    );

    const payload: HttpJwtPayload = { id: httpUser.id };

    const accessToken: string = this.jwtService.sign(payload, {
      secret: tokenSecret + TokenSecretType.AccessToken,
    });
    return { accessToken, refreshToken };
  }

  public async register(payload: CreateUserPort): Promise<UserUsecaseDto> {
    return await this.unitOfWork.runInTransaction(async () => {
      const userRepo = this.unitOfWork.getUserRepository();

      const userExist = await userRepo.findUser({ email: payload.email });

      if (userExist) {
        if (userExist.isValid === true)
          throw Exception.new({
            code: Code.ENTITY_ALREADY_EXISTS_ERROR,
            overrideMessage: "User already exists.",
          });

        if (userExist.isValid === false)
          throw Exception.new({
            code: Code.ENTITY_VALIDATION_ERROR,
            overrideMessage: "User does not valid email",
          });
      }

      const newUser: User = await User.new({
        email: payload.email,
        role: payload.role,
        password: payload.password,
      });

      await userRepo.addUser(newUser);

      const result = UserUsecaseDto.newFromEntity(newUser);

      await this.sendVerificationEmail(newUser);
      return result;
    });
  }

  public async resendVerification(email: string): Promise<any> {
    const userExist = await this.unitOfWork
      .getUserRepository()
      .findUser({ email: email });

    if (!userExist)
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "The user does not exist",
      });

    return await this.sendVerificationEmail(userExist);
  }

  public async confirmEmail(token: string): Promise<void> {
    const tokenSecret = this.configService.get("API_TOKEN_SECRET");
    const payload: HttpUserPayload = await this.jwtService.verifyAsync(token, {
      secret: tokenSecret + TokenSecretType.VerificationEmail,
    });
    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.id });

    if (!user)
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "The user does not exist",
      });

    if (user.isValid === true) return;

    if (user.isValid === false) {
      await user.edit({ isValid: true });
      this.unitOfWork.getUserRepository().updateUser(user);
    }
  }

  public async forgotPassword(email: string): Promise<any> {
    const user = await this.unitOfWork.getUserRepository().findUser({ email });

    if (!user)
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "The user does not exist",
      });

    const payload: HttpUserPayload = {
      id: user.getId(),
      role: user.role,
      isValid: user.isValid,
    };

    const tokenSecret = this.configService.get("API_TOKEN_SECRET");
    const token = this.jwtService.sign(payload, {
      expiresIn: "3m",
      secret: tokenSecret + TokenSecretType.ForgotPassword,
    });

    const resetPasswordURL = this.configService.get("API_RESET_PASSWORD_URL");
    const url = `${resetPasswordURL}?token=${token}`;

    await this.mailerService.sendMail({
      to: email, // list of receivers
      from: this.configService.get("EMAIL_AUTH_USER"), // sender address
      subject: "Quen Mat Khau", // Subject line
      text: "welcome", // plaintext body
      html: `<a href="${url}" target="_blank">Doi mat khau</a>`, // HTML body content
    });

    return { email: email, expiresIn: "3m" };
  }

  public async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<HttpUserPayload> {
    const tokenSecret = this.configService.get("API_TOKEN_SECRET");
    const userPayload: HttpUserPayload = await this.jwtService.verifyAsync(
      payload.token,
      { secret: tokenSecret + TokenSecretType.ForgotPassword },
    );

    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: userPayload.id });
    if (!user)
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "User does not exists.",
      });

    await user.changePassword(payload.newPassword);
    await this.unitOfWork.getUserRepository().updateUser(user);

    return {
      id: user.getId(),
      isValid: user.isValid,
      role: user.role,
    };
  }
}
