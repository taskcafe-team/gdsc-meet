import { RoomType } from "@core/common/enums/RoomEnum";
import { AccessPermissionsStatus } from "@core/domain/participant/usecase/ParticipantUsecase";
import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class HttpResetApiModelGetAccessToken {
  @ApiProperty({ type: "string", required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  customName: string;
}

export class HttpRestApiModelSendMessage {
  @ApiProperty({ type: "string", required: true })
  @IsString()
  roomId: string;

  @ApiProperty({ enum: RoomType })
  @IsEnum(RoomType)
  roomType: RoomType;

  @ApiProperty({ type: "string", required: true })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class HttpRestRespondJoinRequestModel {
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  partIds: string[];

  @IsNotEmpty()
  @IsString()
  status: AccessPermissionsStatus;
}
