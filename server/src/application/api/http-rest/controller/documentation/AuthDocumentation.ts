import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsJWT, IsString, Length, Matches } from "class-validator";

// Property validator
const passValidatorModel = {
  length: {
    min: 4,
    max: 20,
    message: "Password must be between 4 and 20 characters long",
  },
  matches: {
    pattern: /^(?=.*[A-Z])(?=.*d)(?=.*[@#$%^&+=!]).*$/,
    message:
      "Password must contain at least 1 uppercase character, one number and one special character. Exam MyP@ssw0rd",
  },
};

// Validation
export class HttpRestApiModelLogInBody {
  @IsEmail({}, { message: "Email invalidate" })
  @ApiProperty({ type: "string" })
  public email: string;

  @IsString()
  @Length(passValidatorModel.length.min, passValidatorModel.length.max, {
    message: passValidatorModel.length.message,
  })
  @ApiProperty({ type: "string" })
  // @Matches(passValidatorModel.matches.pattern, {
  //   message: passValidatorModel.matches.message,
  // })
  public password: string;
}

export class HttpRestApiModelRegisterBody extends HttpRestApiModelLogInBody {}

export class HttpRestApiModelGetAccessTokenBody {
  @IsJWT() @ApiProperty({ type: "string" }) public refreshToken: string;
}

export class HttpRestApiModelResetPasswordBody {
  @IsJWT() @ApiProperty({ type: "string" }) public token: string;

  @ApiProperty({ type: "string" })
  // @Matches(passValidatorModel.matches.pattern, {
  //   message: passValidatorModel.matches.message,
  // })
  public newPassword: string;
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
