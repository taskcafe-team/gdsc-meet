import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
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
} from "./documentation/AuthDocumentation";
import { HttpUser } from "../auth/decorator/HttpUser";
import { HttpUserAuth } from "../auth/decorator/HttpUserAuth";
import { Request, Response } from "express";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: HttpAuthService) {}

  @Post("email/login")
  @HttpCode(HttpStatus.CREATED)
  public async loginWithEmail(
    @Body() body: HttpRestApiModelLogInBody,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    const result = await this.authService.login(body.email, body.password);
    response.cookie("gdscmeet-refresh-token", result.refreshToken, {
      httpOnly: true,
      path: "/auth/refresh-token",
    });
    return CoreApiResponse.success(result, HttpStatus.CREATED);
  }

  @Post("email/register")
  @HttpCode(HttpStatus.CREATED)
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

    return CoreApiResponse.success(result, HttpStatus.CREATED);
  }

  @Post("verify/access-token")
  @HttpCode(HttpStatus.OK)
  @HttpUserAuth()
  @ApiBearerAuth()
  public async verifyAccessToken() {
    //
  }

  @Post("refresh-token")
  @HttpCode(HttpStatus.CREATED)
  public async refreshToken(
    @Req() req: Request,
  ): Promise<CoreApiResponse<{ accessToken: string }>> {
    const apiRefreshTokenHeader = "gdscmeet-refresh-token";
    const refreshToken = req.cookies[apiRefreshTokenHeader];
    const result = await this.authService.createAccessToken(refreshToken);
    return CoreApiResponse.success(result, HttpStatus.CREATED);
  }

  @Get("email/confirm-email")
  @HttpCode(HttpStatus.OK)
  public async confirmEmail(
    @Query("token") token: string,
  ): Promise<CoreApiResponse<void>> {
    const res = await this.authService.confirmEmail(token);
    return CoreApiResponse.success(res, HttpStatus.OK);
  }

  @Get("email/resend-verification")
  @HttpCode(HttpStatus.OK)
  public async resendVerification(
    @Query("email") email: string,
  ): Promise<CoreApiResponse> {
    await this.authService.resendVerification(email);
    return CoreApiResponse.success(undefined, HttpStatus.OK);
  }

  @Get("email/forgot-password")
  @HttpCode(HttpStatus.OK)
  public async forgotPassword(
    @Query("email") email: string,
  ): Promise<CoreApiResponse> {
    await this.authService.forgotPassword(email);
    return CoreApiResponse.success(undefined, HttpStatus.OK);
  }

  @Post("email/reset-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resetPassword(
    @Body() body: HttpRestApiModelResetPasswordBody,
  ): Promise<CoreApiResponse<void>> {
    await this.authService.resetPassword(body);
    return CoreApiResponse.success(undefined, HttpStatus.NO_CONTENT);
  }

  @Get("google/login")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HttpGoogleOAuthGuard)
  public async loginWithGoogleOAuth() {
    return CoreApiResponse.success(undefined, HttpStatus.NO_CONTENT);
  }

  @Get("google/verify")
  @HttpCode(HttpStatus.OK)
  @UseGuards(HttpGoogleOAuthGuard)
  public async verifyLoginGoogle(
    @HttpUser() user: HttpUserPayload,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    const result = await this.authService.createToken(user);
    return CoreApiResponse.success(result, HttpStatus.OK);
  }
}
