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
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { ParticipantService } from "@application/services/ParticipantService";
import { HttpParticipantPayload } from "../auth/type/HttpParticipantTypes";
import { HttpUserPayload } from "../auth/type/HttpAuthTypes";
import { HttpUser } from "../auth/decorator/HttpUser";
import {
  AccessPermissionsStatus,
  ParticipantAccessTokenDTO,
} from "@core/domain/participant/usecase/ParticipantUsecase";
import { UpdateMeetingDTO } from "@core/domain/meeting/usecase/dto/UpdateMeetingDTO";

@Controller("meetings/:meetingId/participants")
@ApiTags("participants")
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @ApiBearerAuth()
  @Get("access-token")
  @HttpUserAuth()
  @HttpCode(HttpStatus.OK)
  public async getParticipantAccessToken(
    @Param("meetingId") meetingId: string,
    @Query() query: HttpResetApiModelGetAccessToken,
    @HttpUser() httpUser: HttpUserPayload,
  ): Promise<CoreApiResponse<ParticipantAccessTokenDTO>> {
    const { customName } = query;
    const result = await this.participantService.getParticipantAccessToken(
      meetingId,
      customName,
      httpUser.id,
    );
    return CoreApiResponse.success(result);
  }

  @ApiBearerAuth()
  @HttpUserAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put("meeting-permission")
  public async updateMeeting(
    @Param("meetingId") meetingId: string,
    @Body() updateMeetingDto: UpdateMeetingDTO,
    @HttpUser() httpUser: HttpUserPayload,
  ): Promise<CoreApiResponse> {
    await this.participantService.updateMeeting(
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
    @Body() body: { partIds: string[]; status: AccessPermissionsStatus },
    @HttpParticipant() httpParticipant: HttpParticipantPayload,
  ) {
    const { partIds, status } = body;
    await this.participantService.respondJoinRequest(
      httpParticipant,
      meetingId,
      partIds,
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
    @Body() body: HttpRestApiModelSendMessage,
  ) {
    const { roomId, content } = body;
    const result = await this.participantService.sendMessage({
      senderId: sender.id,
      sendTo: { roomId },
      content,
    });
    return CoreApiResponse.success(result);
  }
}
