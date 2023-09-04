import { ApiProperty } from "@nestjs/swagger";

export class HttpRestApiModelLogInBody {
  @ApiProperty({ type: "string" }) public email: string;
  @ApiProperty({ type: "string" }) public password: string;
}

export class HttpRestApiModelLoggedInUser {
  @ApiProperty({ type: "string" }) public id: string;
  @ApiProperty({ type: "string" }) public accessToken: string;
}

export class HttpRestApiModelRegisterBody {
  @ApiProperty({ type: "string" }) public email: string;
  @ApiProperty({ type: "string" }) public password: string;
}

export class HttpRestApiModelResetPasswordBody {
  @ApiProperty({ type: "string" }) public newPassword: string;
}

export class HttpRestApiResponseLoggedInUser {
  @ApiProperty({ type: HttpRestApiModelLoggedInUser })
  public data: HttpRestApiModelLoggedInUser;
}
