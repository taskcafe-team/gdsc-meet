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
} from "@nestjs/common";
import { ApiBody, ApiTags, ApiResponse } from "@nestjs/swagger";

import { CreateUserAdapter } from "@infrastructure/adapter/usecase/user/CreateUserAdapter";

import { UserRole } from "@core/common/enums/UserEnums";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

import { HttpAuthService } from "../auth/HttpAuthService";
import { HttpLocalAuthGuard } from "../auth/guard/HttpLocalAuthGuard";
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
import { HttpFacebookAuthGuard } from "../auth/guard/HttpFacebookAuthGuard";
import { Request } from "express";
import { AuthGuard } from "@nestjs/passport";
import { GenerateLivekitJWT } from "@infrastructure/adapter/usecase/webrtc/livekit/GenerateLivekitJWT";

@Controller("auth")
@ApiTags("auth") // dùng để đánh dấu các nhóm API có tên là auth và tư động tạo tại liệu API
export class AuthController {
  constructor(private readonly authService: HttpAuthService,
    private readonly generateLivekitJWT: GenerateLivekitJWT) {}
  @Get("getJWT")
  public async getJWT(){
      return this.generateLivekitJWT.createToken()
  }
  // Begin login Basic 

  @Post("email/login")
  @HttpCode(HttpStatus.OK)
  //@UseGuards dùng để kiểm tra và quyết định xem một request cho được phép tiếp tực thực thi hay không
  @UseGuards(HttpLocalAuthGuard) 
  // Hàm loginWithEmail dùng để đăng nhập với tài khoản và mật khẩu
  public async loginWithEmail(
    @Req() request: HttpRequestWithUser,
    @Body() body: HttpRestApiModelLogInBody,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    // biến result sẽ lưu lại id,accesstoken, refreshtoken của user 
    const result = await this.authService.login(request.user);
    //console.log(result.accessToken)
    return CoreApiResponse.success(result);
  }

  @Post("access-token")
  @ApiResponse({ status: HttpStatus.OK })
  public async getAccessToken(
    @Body() body: { refreshToken: string },
  ): Promise<CoreApiResponse<{ accessToken: string }>> {
    const result = await this.authService.getAccessToken(body.refreshToken);
    return CoreApiResponse.success(result);
  }

  @Post("email/register")
  @HttpCode(HttpStatus.CREATED)
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
    //console.log(CoreApiResponse.success(result))
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
  @HttpCode(HttpStatus.OK)
  public async resendVerification(
    @Query("email") email: string,
  ): Promise<CoreApiResponse<void>> {
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
    @Body() body: { token: string; newPassword: string },
  ): Promise<CoreApiResponse<void>> {
    await this.authService.resetPassword(body);
    return CoreApiResponse.success();
  }
  // End login with Basic 

  // Begin login with Google OAuth2 
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
    @Req() request: HttpRequestWithUser,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    const result = await this.authService.login(request.user);
    return CoreApiResponse.success(result);
  }

// End Login with Google OAuth2

// Begin Login with Facebook OAuth2
  // @Get("facebook/login")
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(HttpFacebookAuthGuard)
  // public async facebookLogin() {
  //   return;
  // }

  @Get("facebook")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HttpFacebookAuthGuard)
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  // @Get("facebook/callback")
  // @UseGuards(HttpFacebookAuthGuard)
  // async facebookLoginRedirect(@Req() req: Request): Promise<any> {
  //   return req.user;
  // }
  @Get("facebook/callback")
  @UseGuards(HttpFacebookAuthGuard)
  public async redirectLoginFacebook(
    @Req() request: HttpRequestWithUser,
  ): Promise<CoreApiResponse<HttpLoggedInUser>> {
    const result = await this.authService.login(request.user);
    
    return CoreApiResponse.success(result);
  }
  
}

// End Login with Facebook OAuth2

