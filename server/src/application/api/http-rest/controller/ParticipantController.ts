import ParticipantService from "@core/services/participant/ParticipantService";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { HttpRestApiModelSendMessage } from "./documentation/ParticipantDocumantion";
import { HttpUserAuth } from "../auth/decorator/HttpUserAuth";
import { HttpParticipantAuth } from "../auth/decorator/HttpParticipantAuth";
import { HttpParticipant } from "../auth/decorator/HttpParticipant";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { AccessTokenMetadata } from "@infrastructure/adapter/webrtc/Types";

@Controller("meetings/:meetingId/participants")
@ApiTags("participants")
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Get("access-token")
  @HttpUserAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getAccessToken(
    @Param("meetingId") meetingId: string,
    // @Query("roomType") roomType?: RoomType,
    // @Query("participantName") participantName?: string,
  ) {
    const adapter = { meetingId };
    const result = await this.participantService.getAccessToken(adapter);

    return CoreApiResponse.success(result);
  }

  // @Get(":participantId")
  // @HttpAuth()
  // @ApiBearerAuth()
  // @HttpCode(HttpStatus.OK)
  // public getParticipant(
  //   @Param("meetingId") meetingId: string,
  //   @Param("participantId") participantId: string,
  // ) {}

  // @Get("")
  // @HttpAuth()
  // @ApiBearerAuth()
  // @HttpCode(HttpStatus.OK)
  // public getParticipants(@Param("meetingId") meetingId: string) {}

  // @Get(":participantId")
  // @HttpAuth()
  // @ApiBearerAuth()
  // @HttpCode(HttpStatus.OK)
  // public requestJoinMeeting(
  //   @Param("meetingId") meetingId: string,
  //   @Param("participantId") participantId: string,
  // ) {}
  @Post("send-message")
  @ApiBearerAuth()
  @HttpUserAuth()
  @HttpParticipantAuth()
  @ApiBody({ type: HttpRestApiModelSendMessage })
  public async sendMessage(
    @HttpParticipant() sender: AccessTokenMetadata,
    @Param("meetingId") meetingId: string,
    @Body() body: HttpRestApiModelSendMessage,
  ) {
    const { roomId, roomType, content } = body;
    const result = await this.participantService.sendMessage({
      roomId,
      roomType,
      content,
      senderId: sender.id,
    });
    return CoreApiResponse.success(result);
  }
}
