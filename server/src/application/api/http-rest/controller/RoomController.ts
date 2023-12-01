import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HttpParticipantAuth } from "../auth/decorator/HttpParticipantAuth";
import { HttpParticipantPayload } from "../auth/type/HttpParticipantTypes";
import { RoomService } from "@application/services/RoomService";
import { HttpParticipant } from "../auth/decorator/HttpParticipant";
import { HttpRoomCreateAccessTokenQueryModel } from "./documentation/RoomDocumentation";

@ApiTags("rooms")
@Controller("rooms")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get("access-token")
  @HttpParticipantAuth()
  @HttpCode(HttpStatus.OK)
  async getAccessToken(
    @Query() query: HttpRoomCreateAccessTokenQueryModel,
    @HttpParticipant() part: HttpParticipantPayload,
  ) {
    const { roomId } = query;
    const result = await this.roomService.createRoomAccessToken(roomId, part);
    return CoreApiResponse.success(result, HttpStatus.OK);
  }
}
