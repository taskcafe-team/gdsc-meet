import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsJWT, IsString } from "class-validator";

export class HttpRestApiModelLogInBody {
  @IsEmail({}, { message: "Email không đúng định dạng" })
  @ApiProperty({ type: "string" })
  public email: string;

  @IsString() @ApiProperty({ type: "string" }) public password: string;
}

export class HttpRestApiModelRegisterBody {
  @IsEmail({}, { message: "Email không đúng định dạng" })
  @ApiProperty({ type: "string" })
  public email: string;

  @ApiProperty({ type: "string" }) public password: string;
}

export class HttpRestApiModelGetAccessTokenBody {
  @IsJWT() @ApiProperty({ type: "string" }) public refreshToken: string;
}

export class HttpRestApiModelResetPasswordBody {
  @IsJWT() @ApiProperty({ type: "string" }) public token: string;
  @ApiProperty({ type: "string" }) public newPassword: string;
}

// --

export class HttpRestApiModelLoggedInUser {
  @ApiProperty({ type: "string" }) public id: string;
  @ApiProperty({ type: "string" }) public accessToken: string;
}

export class HttpRestApiResponseLoggedInUser {
  @ApiProperty({ type: HttpRestApiModelLoggedInUser })
  public data: HttpRestApiModelLoggedInUser;
}
