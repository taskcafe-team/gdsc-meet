import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import {
  HttpResetApiModelGetAccessToken,
  HttpRestApiModelSendMessage,
} from "./documentation/ParticipantDocumantion";
import { HttpUserAuth } from "../auth/decorator/HttpUserAuth";
import { HttpParticipantAuth } from "../auth/decorator/HttpParticipantAuth";
import { HttpParticipant } from "../auth/decorator/HttpParticipant";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { RespondJoinStatus } from "@infrastructure/adapter/webrtc/Types";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { ParticipantService } from "@application/services/ParticipantService";
import { HttpParticipantPayload } from "../auth/type/HttpParticipantTypes";
import { UpdateMeetingBodyModel } from "./documentation/MeetingDocumentation";
import { HttpUserPayload } from "../auth/type/HttpAuthTypes";
import { HttpUser } from "../auth/decorator/HttpUser";

@Controller("meetings/:meetingId/participants")
@ApiTags("participants")
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @ApiBearerAuth()
  @Get("access-token")
  @HttpUserAuth()
  @HttpCode(HttpStatus.OK)
  public async getAccessToken(
    @Param("meetingId") meetingId: string,
    @Query() query: HttpResetApiModelGetAccessToken,
  ) {
    const result = await this.participantService.getAccessToken({
      meetingId,
      participantName: query.customName,
    });

    return CoreApiResponse.success(result);
  }

  @ApiBearerAuth()
  @HttpUserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put("meeting-permission")
  public async updateMeeting(
    @Param("meetingId") meetingId: string,
    @Body() updateMeetingDto: UpdateMeetingBodyModel,
    @HttpUser() httpUser: HttpUserPayload,
  ): Promise<CoreApiResponse> {
    await this.participantService.updateMyMeeting(
      httpUser,
      meetingId,
      updateMeetingDto,
    );
    return CoreApiResponse.success(undefined, HttpStatus.NO_CONTENT);
  }

  @Patch("respond-join-request")
  @HttpCode(HttpStatus.NO_CONTENT)
  @HttpParticipantAuth(ParticipantRole.HOST)
  @ApiBearerAuth()
  public async respondJoinRequest(
    @Param("meetingId") meetingId: string,
    @Body() body: { participantIds: string[]; status: RespondJoinStatus },
    @HttpParticipant() httpParticipant: HttpParticipantPayload,
  ) {
    const { participantIds, status } = body;
    await this.participantService.respondJoinRequest(
      httpParticipant.id,
      meetingId,
      participantIds,
      status,
    );
    return CoreApiResponse.success(undefined, HttpStatus.NO_CONTENT);
  }

  @Post("send-message")
  @ApiBearerAuth()
  @HttpUserAuth()
  @HttpParticipantAuth()
  @ApiBody({ type: HttpRestApiModelSendMessage })
  public async sendMessage(
    @HttpParticipant() sender: HttpParticipantPayload,
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
