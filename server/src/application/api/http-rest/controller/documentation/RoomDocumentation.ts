import { IsNotEmpty, IsString } from "class-validator";

export class HttpRoomCreateAccessTokenQueryModel {
  @IsString() @IsNotEmpty() roomId: string;
}
