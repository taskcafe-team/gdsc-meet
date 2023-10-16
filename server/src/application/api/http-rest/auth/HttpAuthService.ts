import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ConsoleLogger, HttpStatus, Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

import {
  HttpJwtPayload,
  HttpLoggedInUser,
  HttpUserPayload,
} from "@application/api/http-rest/auth/type/HttpAuthTypes";

import { User } from "@core/domain/user/entity/User";
import { Nullable } from "@core/common/type/CommonTypes";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { Exception } from "@core/common/exception/Exception";
import { Code } from "@core/common/code/Code";
import { CreateUserPort } from "@core/domain/user/port/CreateUserPort";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

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

  private async sendVerificationEmail(
    user: User,
  ): Promise<{ token: string; expiresIn: number }> {
    if (user.isValid) throw Exception.new({ code: Code.BAD_REQUEST_ERROR });
    if (!user.email) throw Exception.new({ code: Code.BAD_REQUEST_ERROR });

    const payload: HttpJwtPayload = { id: user.getId() };

    const expiresIn = this.configService.get(
      "EMAIL_VERIFICATION_TOKEN_SECRET_TTL_IN_MINUTES",
    );

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get("EMAIL_VERIFICATION_TOKEN_SECRET"),
      expiresIn: `${expiresIn}m`,
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

    return { token, expiresIn };
  }

  public async login(user: HttpUserPayload): Promise<HttpLoggedInUser> {
    const payload: HttpJwtPayload = { id: user.id };

    const accessToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get("API_ACCESS_TOKEN_SECRET"),
      expiresIn:
        this.configService.get("API_ACCESS_TOKEN_TTL_IN_MINUTES") + "m",
    });

    const refreshToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get("API_REFRESH_TOKEN_SECRET"),
      expiresIn:
        this.configService.get("API_REFRESH_TOKEN_TTL_IN_MINUTES") + "m",
    });

    return {
      id: user.id,
      accessToken,
      refreshToken,
    };
  }

  public async getAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const httpUser = await this.jwtService.verifyAsync<HttpUserPayload>(
      refreshToken,
      { secret: this.configService.get("API_REFRESH_TOKEN_SECRET") },
    );

    const payload: HttpUserPayload = httpUser;
    console.log(payload)
    
    const accessToken: string = this.jwtService.sign(payload, {
      secret: this.configService.get("API_ACCESS_TOKEN_SECRET"),
      // expiresIn:
      //   this.configService.get("API_ACCESS_TOKEN_TTL_IN_MINUTES") + "m",
    });
    return { accessToken };
  }

  public async register(payload: CreateUserPort): Promise<UserUsecaseDto> {
    return await this.unitOfWork.runInTransaction(async () => {
      const userRepo = this.unitOfWork.getUserRepository();

      const userExist = await userRepo.findUser({ email: payload.email });

      if (userExist)
        throw Exception.new({
          code: Code.CONFLICT_ERROR,
          overrideMessage: "Email is already in use.",
        });

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

  public async resendVerification(
    email: string,
  ): Promise<{ expiresIn: number }> {
    const userExist = await this.unitOfWork
      .getUserRepository()
      .findUser({ email: email });

    if (!userExist) throw Exception.new({ code: Code.ENTITY_NOT_FOUND_ERROR });

    const resut = await this.sendVerificationEmail(userExist);
    return { expiresIn: resut.expiresIn };
  }

  public async confirmEmail(token: string): Promise<void> {
    const secret = this.configService.get("EMAIL_VERIFICATION_TOKEN_SECRET");
    const payload: HttpUserPayload = await this.jwtService
      .verifyAsync(token, { secret })
      .catch((error) => error);

    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: payload.id });

    if (!user) throw Exception.new({ code: Code.ENTITY_NOT_FOUND_ERROR });

    if (user.isValid)
      throw Exception.new({
        code: Code.SUCCESS,
        overrideMessage: "Email has been verified.",
      });

    await user.edit({ isValid: true });
    await this.unitOfWork.getUserRepository().updateUser(user);
  }

  public async forgotPassword(email: string): Promise<any> {
    const user = await this.unitOfWork.getUserRepository().findUser({ email });

    if (!user) throw Exception.new({ code: Code.NOT_FOUND_ERROR });

    const payload: HttpJwtPayload = { id: user.getId() };

    const secret = this.configService.get("EMAIL_VERIFICATION_TOKEN_SECRET");
    const expiresIn = this.configService.get(
      "EMAIL_VERIFICATION_TOKEN_SECRET_TTL_IN_MINUTES",
    );
    const token = this.jwtService.sign(payload, {
      expiresIn: expiresIn + "m",
      secret,
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

    return { email: email, expiresIn };
  }

  public async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<HttpUserPayload> {
    const secret = this.configService.get("EMAIL_VERIFICATION_TOKEN_SECRET");

    const userPayload: HttpJwtPayload = await this.jwtService.verifyAsync(
      payload.token,
      { secret },
    );

    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: userPayload.id });
    if (!user) throw Exception.new({ code: Code.ENTITY_NOT_FOUND_ERROR });

    await user.changePassword(payload.newPassword);
    await this.unitOfWork.getUserRepository().updateUser(user);

    return {
      id: user.getId(),
      isValid: user.isValid,
      role: user.role,
    };
  }
}
