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
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiTags, ApiResponse } from "@nestjs/swagger";
import { HttpLocalAuthGuard } from "../auth/guard/HttpLocalAuthGuard";
import { CreateUserAdapter } from "@infrastructure/adapter/usecase/user/CreateUserAdapter";
import { UserRole } from "@core/common/enums/UserEnums";
import { HttpAuthService } from "../auth/HttpAuthService";
import {
  HttpLoggedInUser,
  HttpRequestWithUser,
} from "../auth/type/HttpAuthTypes";
import { HttpGoogleOAuthGuard } from "../auth/guard/HttpGoogleOAuthGuard";
import {
  HttpRestApiModelRegisterBody,
  HttpRestApiModelLogInBody,
  HttpRestApiModelResetPasswordBody,
} from "./documentation/AuthDocumentation";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: HttpAuthService) {}

  @Post("email/login")
  @HttpCode(HttpStatus.OK)
  @UseGuards(HttpLocalAuthGuard)
  @ApiBody({ type: HttpRestApiModelLogInBody })
  @ApiResponse({ status: HttpStatus.OK, type: HttpRestApiModelLogInBody })
  public async loginWithEmail(
    @Req() request: HttpRequestWithUser,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    const result = await this.authService.login(request.user);
    return CoreApiResponse.success(result);
  }

  @Post("email/register")
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: HttpRestApiModelRegisterBody })
  public async registerWithEmail(
    @Body() body: HttpRestApiModelRegisterBody,
  ): Promise<CoreApiResponse<UserUsecaseDto>> {
    const adapter: CreateUserAdapter = await CreateUserAdapter.new({
      firstName: null,
      lastName: null,
      email: body.email,
      role: UserRole.USER,
      password: body.password,
      avatar: null,
      providerName: null,
      providerId: null,
    });
    const result = await this.authService.register(adapter);

    return CoreApiResponse.success(result);
  }

  @Get("email/confirm-email")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async confirmEmail(
    @Query("token") token: string,
  ): Promise<CoreApiResponse<void>> {
    await this.authService.confirmEmail(token);
    return CoreApiResponse.success();
  }

  @Get("email/resend-verification")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HttpLocalAuthGuard)
  public async resendVerification(
    @Query() email: string,
  ): Promise<CoreApiResponse<void>> {
    await this.authService.resendVerification(email);
    return CoreApiResponse.success();
  }

  @Get("email/forgot-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async forgotPassword(
    @Query("email") email: string,
  ): Promise<CoreApiResponse<any>> {
    const result = await this.authService.forgotPassword(email);
    return CoreApiResponse.success(result);
  }

  @Post("email/reset-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: HttpRestApiModelResetPasswordBody })
  public async resetPassword(
    @Query("token") token: string,
    @Body() body: HttpRestApiModelResetPasswordBody,
  ): Promise<CoreApiResponse<void>> {
    await this.authService.resetPassword({
      token,
      newPassword: body.newPassword,
    });
    return CoreApiResponse.success();
  }

  @Get("google/login")
  @HttpCode(HttpStatus.OK)
  @UseGuards(HttpGoogleOAuthGuard)
  public async loginWithGoogleOAuth(): Promise<void> {
    return;
  }

  @Get("google/verify")
  @HttpCode(HttpStatus.OK)
  @UseGuards(HttpGoogleOAuthGuard)
  @ApiResponse({ status: HttpStatus.OK, type: HttpRestApiModelLogInBody })
  public async verifyLoginGoogle(
    @Req() request: HttpRequestWithUser,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    const result = await this.authService.login(request.user);
    return CoreApiResponse.success(result);
  }
}
