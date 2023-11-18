import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

import { CreateUserAdapter } from "@infrastructure/adapter/usecase/user/CreateUserAdapter";

import { UserRole } from "@core/common/enums/UserEnums";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

import { HttpAuthService } from "../auth/HttpAuthService";
import { HttpLoggedInUser, HttpUserPayload } from "../auth/type/HttpAuthTypes";
import { HttpGoogleOAuthGuard } from "../auth/guard/HttpGoogleOAuthGuard";
import {
  HttpRestApiModelRegisterBody,
  HttpRestApiModelLogInBody,
  HttpRestApiModelResetPasswordBody,
  HttpRestApiModelGetAccessTokenBody,
} from "./documentation/AuthDocumentation";
import { HttpUser } from "../auth/decorator/HttpUser";
import { HttpUserAuth } from "../auth/decorator/HttpUserAuth";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: HttpAuthService) {}

  @Post("email/login")
  public async loginWithEmail(
    @Body() body: HttpRestApiModelLogInBody,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    const result = await this.authService.login(body.email, body.password);
    return CoreApiResponse.success(result);
  }

  @Post("email/register")
  public async registerWithEmail(
    @Body(new ValidationPipe()) body: HttpRestApiModelRegisterBody,
  ): Promise<CoreApiResponse<UserUsecaseDto>> {
    const adapter: CreateUserAdapter = await CreateUserAdapter.new({
      firstName: null,
      lastName: null,
      email: body.email,
      role: UserRole.USER,
      password: body.password,
      avatar: null,
      authProviderName: null,
      providerId: null,
    });
    const result = await this.authService.register(adapter);

    return CoreApiResponse.success(result);
  }

  @Post("verify/access-token")
  @HttpUserAuth()
  @ApiBearerAuth()
  public async verifyAccessToken() {
    //
  }

  @Post("access-token")
  public async getAccessToken(
    @Body(new ValidationPipe()) body: HttpRestApiModelGetAccessTokenBody,
  ): Promise<CoreApiResponse<{ accessToken: string }>> {
    const result = await this.authService.getAccessToken(body.refreshToken);
    return CoreApiResponse.success(result);
  }

  @Get("email/confirm-email")
  public async confirmEmail(
    @Query("token") token: string,
  ): Promise<CoreApiResponse<void>> {
    const res = await this.authService.confirmEmail(token);
    return CoreApiResponse.success(res);
  }

  @Get("email/resend-verification")
  public async resendVerification(
    @Query("email") email: string,
  ): Promise<CoreApiResponse> {
    await this.authService.resendVerification(email);
    return CoreApiResponse.success();
  }

  @Get("email/forgot-password")
  @HttpCode(HttpStatus.OK)
  public async forgotPassword(
    @Query("email") email: string,
  ): Promise<CoreApiResponse<void>> {
    const result = await this.authService.forgotPassword(email);
    return CoreApiResponse.success(result);
  }

  @Post("email/reset-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resetPassword(
    @Body() body: HttpRestApiModelResetPasswordBody,
  ): Promise<CoreApiResponse<void>> {
    await this.authService.resetPassword(body);
    return CoreApiResponse.success();
  }

  @Get("google/login")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HttpGoogleOAuthGuard)
  public async loginWithGoogleOAuth() {
    return;
  }

  @Get("google/verify")
  @HttpCode(HttpStatus.OK)
  @UseGuards(HttpGoogleOAuthGuard)
  public async verifyLoginGoogle(
    @HttpUser() user: HttpUserPayload,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    const result = await this.authService.createToken(user);
    return CoreApiResponse.success(result);
  }
}
