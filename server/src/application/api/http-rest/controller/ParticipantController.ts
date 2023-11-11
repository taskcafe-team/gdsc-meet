import ParticipantService from "@core/services/participant/ParticipantService";
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { HttpRestApiModelSendMessage } from "./documentation/ParticipantDocumantion";
import { HttpUserAuth } from "../auth/decorator/HttpUserAuth";
import { HttpParticipantAuth } from "../auth/decorator/HttpParticipantAuth";

@Controller("meetings/:meetingId/participants")
@ApiTags("participants")
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

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
  @HttpCode(HttpStatus.OK)
  public async sendMessage(
    @Param("meetingId") meetingId: string,
    @Body() body: HttpRestApiModelSendMessage,
  ) {
    return await this.participantService.sendMessage({
      sendto: { meetingId },
      message: body.message,
    });
  }
}

// MODERATOR
