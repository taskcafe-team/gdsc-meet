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
import { IUnitOfWork } from "@core/common/persistence/IUnitOfWork";
import { PrismaService } from "@infrastructure/adapter/persistence/prisma/PrismaService";
import { CommonDITokens } from "@core/common/DIToken/CommonDITokens";
import { MailerService } from "@nestjs-modules/mailer";
import { Exception } from "@core/common/exception/Exception";
import { Code } from "@core/common/code/Code";
import { CreateUserPort } from "@core/domain/user/port/CreateUserPort";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

@Injectable()
export class HttpAuthService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CommonDITokens.UnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  public async validateUser(
    email: string,
    password: string,
  ): Promise<Nullable<HttpUserPayload>> {
    const user = await this.unitOfWork.getUserRepository().findUser({ email });

    if (!user || !(await user.comparePassword(password))) {
      return null;
    }

    return { id: user.getId(), role: user.role };
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const payload: HttpUserPayload = { id: user.getId(), role: user.role };
    const token = this.jwtService.sign(payload, { expiresIn: "5m" });

    const url = `http://localhost:8080/auth/email/confirm-email?token=${token}`;

    const fromBy = "anne.kshlerin90@ethereal.email";

    await this.mailerService.sendMail({
      to: user.email!,
      from: fromBy,
      subject: "Xác thực email",
      text: "welcome",
      html: `<a href="${url}" target="_blank">Xác Thực</a>`,
    });
  }

  public async login(user: HttpUserPayload): Promise<HttpLoggedInUser> {
    const payload: HttpJwtPayload = { id: user.id };
    return {
      id: user.id,
      accessToken: this.jwtService.sign(payload),
      // refreshToken: this.jwtService.sign(payload, { expiresIn: "10d" }),
    };
  }

  public async register(payload: CreateUserPort): Promise<UserUsecaseDto> {
    return await this.prismaService.$transaction<UserUsecaseDto>(
      async (prisma) => {
        this.unitOfWork.setContext(prisma);

        const userExist = await this.unitOfWork
          .getUserRepository()
          .findUser({ email: payload.email });

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

        await this.unitOfWork.getUserRepository().addUser(newUser);

        const result = UserUsecaseDto.newFromEntity(newUser);

        await this.sendVerificationEmail(newUser);
        return result;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  public async resendVerification(email: string): Promise<void> {
    const userExist = await this.unitOfWork
      .getUserRepository()
      .findUser({ email });

    if (!userExist)
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "The user does not exist",
      });

    await this.sendVerificationEmail(userExist);
  }

  public async confirmEmail(token: string): Promise<void> {
    const payload: HttpUserPayload = await this.jwtService.verifyAsync(token);
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

    const payload: HttpUserPayload = { id: user.getId(), role: user.role };
    const token = this.jwtService.sign(payload, { expiresIn: "3m" });

    const url = `http://localhost:8080/email/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email, // list of receivers
      from: "anne.kshlerin90@ethereal.email", // sender address
      subject: "Quen Mat Khau", // Subject line
      text: "welcome", // plaintext body
      html: `<a href="${url}" target="_blank">Doi mat khau</a>`, // HTML body content
    });

    return { email: email, expiresIn: "5m" };
  }

  public async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<any> {
    const userPayload: HttpUserPayload = await this.jwtService.verifyAsync(
      payload.token,
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

    const result = { id: user.getId(), email: user.email, role: user.role };
    return result;
  }
}
