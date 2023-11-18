import { RoomType } from "@infrastructure/adapter/webrtc/Types";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class HttpResetApiModelGetAccessToken {
  @ApiProperty({ type: "string", required: true })
  @IsString()
  @IsNotEmpty()
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
