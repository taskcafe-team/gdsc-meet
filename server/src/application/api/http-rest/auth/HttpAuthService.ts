import { ConfigService } from "@nestjs/config";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  HttpLoggedInUser,
  HttpUserPayload,
} from "@application/api/http-rest/auth/type/HttpAuthTypes";

import { User } from "@core/domain/user/entity/User";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { CreateUserPort } from "@core/domain/user/usecase/port/CreateUserPort";
import { UserUsecaseDTO } from "@core/domain/user/usecase/dto/UserUsecaseDTO";
import { Nullable } from "@core/common/type/CommonTypes";
import { AppException } from "@core/common/exception/AppException";
import { AppErrors } from "@core/common/exception/AppErrors";
import { CustomJwtService } from "@application/services/JwtService";
import { EmailService } from "@application/services/EmailService";
import { AppConfig } from "@infrastructure/config/AppConfig";
import { MailServiceConfig } from "@infrastructure/config/MailServiceConfig";

@Injectable()
export class HttpAuthService {
  constructor(
    private readonly configService: ConfigService<
      AppConfig & MailServiceConfig,
      true
    >,
    private readonly unitOfWork: UnitOfWork,
    private readonly jwtService: CustomJwtService,
    private readonly emailService: EmailService,
  ) {}

  public async createToken(
    payload: HttpUserPayload,
  ): Promise<HttpLoggedInUser> {
    const id = payload.id;

    const accessToken = this.jwtService.generateUserAccessToken({ id });
    const refreshToken = this.jwtService.generateUserRefreshToken({ id });

    return {
      id: payload.id,
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  }

  public async createAccessToken(
    refreshToken: any,
  ): Promise<{ accessToken: string }> {
    if (!refreshToken || typeof refreshToken !== "string")
      throw new UnauthorizedException("Invalid token");

    const userJwt = this.jwtService.verifyUserRefreshToken(refreshToken);
    const { id } = userJwt;
    const accessToken = this.jwtService.generateUserAccessToken({ id });
    return { accessToken: accessToken.token };
  }

  public async getUser(by: {
    id?: string;
    email?: string;
  }): Promise<Nullable<User>> {
    return await this.unitOfWork.getUserRepository().findUser(by);
  }

  public async registerWithGoogle(user: User): Promise<{ id: string }> {
    const result = await this.unitOfWork.getUserRepository().addUser(user);
    const id = result.id;
    return { id };
  }

  public async register(payload: CreateUserPort): Promise<UserUsecaseDTO> {
    return await this.unitOfWork.runInTransaction(async () => {
      const userRepo = this.unitOfWork.getUserRepository();

      const userExist = await userRepo.findUser({ email: payload.email });
      if (userExist) throw new ConflictException("Email is already in use.");

      const newUser: User = await User.new({
        email: payload.email,
        role: payload.role,
        password: payload.password,
      });

      await userRepo.addUser(newUser);
      const result = UserUsecaseDTO.newFromEntity(newUser);

      await this.sendVerificationEmail(newUser);
      return result;
    });
  }

  public async login(
    email: string,
    password: string,
  ): Promise<HttpLoggedInUser> {
    const user = await this.unitOfWork.getUserRepository().findUser({ email });
    if (!user || !(await user.comparePassword(password)))
      throw new UnauthorizedException("Email or password is invalid");

    return this.createToken({
      id: user.id,
      role: user.role,
      isValid: user.isValid,
    });
  }

  private async sendVerificationEmail(
    user: User,
  ): Promise<{ token: string; expiresIn: string }> {
    if (user.isValid) throw new BadRequestException();
    if (!user.email) throw new BadRequestException();

    const id = user.id;
    const token = this.jwtService.generateEmailVerificationToken({ id });

    const confirmEmailURL = this.configService.get("API_CONFIRM_EMAIL_URL");
    const url = `${confirmEmailURL}?token=${token}`;
    const html = `<a href="${url}" target="_blank">Xác Thực</a>`;
    await this.emailService.sendEmail(user.email, "Xác thực email", html);
    return token;
  }

  public async resendVerification(
    email: string,
  ): Promise<{ expiresIn: string }> {
    const userExist = await this.unitOfWork
      .getUserRepository()
      .findUser({ email });
    if (!userExist) throw new AppException(AppErrors.ENTITY_NOT_FOUND_ERROR);

    const resut = await this.sendVerificationEmail(userExist);
    return { expiresIn: resut.expiresIn };
  }

  public async confirmEmail(token: string): Promise<void> {
    const userJwt = this.jwtService.verifyEmailVerificationToken(token);

    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: userJwt.id });
    if (!user) throw new AppException(AppErrors.ENTITY_NOT_FOUND_ERROR);

    if (user.isValid) return;
    await user.edit({ isValid: true });
    await this.unitOfWork.getUserRepository().updateUser(user);
  }

  public async forgotPassword(
    email: string,
  ): Promise<{ email: string; expiresIn: string }> {
    const user = await this.unitOfWork.getUserRepository().findUser({ email });
    if (!user) throw new NotFoundException("Email does not exist");

    const id = user.id;
    const token = this.jwtService.generateEmailVerificationToken({ id }); //TODO: error

    const resetPasswordURL = this.configService.get("API_RESET_PASSWORD_URL");
    const url = `${resetPasswordURL}?token=${token}`;
    const html = `<a href="${url}" target="_blank">Doi mat khau</a>`;
    await this.emailService.sendEmail(email, "Quen Mat Khau", html);

    return {
      email: email,
      expiresIn: token.expiresIn,
    };
  }

  public async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<HttpUserPayload> {
    const secret = this.configService.get("EMAIL_VERIFICATION_TOKEN_SECRET");
    const userJwt = await this.jwtService.verifyEmailVerificationToken(secret);

    const user = await this.unitOfWork
      .getUserRepository()
      .findUser({ id: userJwt.id });
    if (!user) throw new AppException(AppErrors.ENTITY_NOT_FOUND_ERROR);

    await user.changePassword(payload.newPassword);
    await this.unitOfWork.getUserRepository().updateUser(user);

    return {
      id: user.id,
      isValid: user.isValid,
      role: user.role,
    };
  }
}
