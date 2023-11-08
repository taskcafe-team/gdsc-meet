import { MeetingService } from "@core/services/meeting/MeetingService";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";

import { HttpAuth } from "../auth/decorator/HttpAuth";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import {
  HttpRestApiModelCreateMeetingBody,
  HttpRestApiModelDeleteMeetingsBody,
} from "./documentation/MeetingDocumentation";
import { ParticipantUsecaseDto } from "@core/domain/participant/usecase/dto/ParticipantUsecaseDto";
import { MeetingUsecaseDto } from "@core/domain/meeting/usecase/MeetingUsecaseDto";

@Controller("meeting")
@ApiTags("meeting")
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post("")
  @HttpAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: HttpRestApiModelCreateMeetingBody })
  public async createMeeting(@Body() body: HttpRestApiModelCreateMeetingBody) {
    const adapter = {
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status,
    };
    const result = await this.meetingService.createMeeting(adapter);
    return CoreApiResponse.success(result);
  }

  @Get("")
  @HttpAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getMyMeetings() {
    const result = await this.meetingService.getMyMeetings();
    return CoreApiResponse.success(result);
  }

  @Delete("")
  @HttpAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteMeetings(
    @Query("ids", new ParseArrayPipe({ items: String, separator: "," }))
    ids: string[],
  ) {
    const result = await this.meetingService.deleteMeetings({
      meetingIds: ids,
    });
    return CoreApiResponse.success(result);
  }

  @Get(":friendlyId")
  @HttpAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getMeeting(
    @Param("friendlyId") friendlyId: string,
  ): Promise<CoreApiResponse<MeetingUsecaseDto & { friendlyId: string }>> {
    const adapter = { friendlyId };
    const result = await this.meetingService.getMeeting(adapter);
    return CoreApiResponse.success(result);
  }

  @Get(":friendlyId/access-token")
  @HttpAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getAccessToken(@Param("friendlyId") friendlyId: string) {
    const adapter = { friendlyId };
    const result = await this.meetingService.getAccessToken(adapter);
    return CoreApiResponse.success(result);
  }

  @Get(":friendlyId/participant")
  @HttpCode(HttpStatus.OK)
  public async getParticipants(
    @Param("friendlyId") friendlyId: string,
  ): Promise<CoreApiResponse<ParticipantUsecaseDto[]>> {
    const adapter = { friendlyId };
    const result = await this.meetingService.getParticipants(adapter);
    return CoreApiResponse.success(result);
  }

  @Get(":friendlyId/participant/:participantId")
  @HttpCode(HttpStatus.OK)
  public async getParticipant(
    @Param("friendlyId") friendlyId: string,
    @Param("participantId") participantId: string,
  ): Promise<CoreApiResponse<ParticipantUsecaseDto>> {
    const adapter = { friendlyId, participantId };
    const result = await this.meetingService.getParticipant(adapter);

    return CoreApiResponse.success(result);
  }

  @Patch(":friendlyId/participant/req-join-meeting")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async requestJoinMeeting(@Query("token") token: string) {
    return await this.meetingService.requestJoinMeeting({ token });
  }

  @Patch(":friendlyId/participant/:participantId")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resJoinRoom(
    @Param("friendlyId") friendlyId: string,
    @Param("participantId") participantId: string,
  ) {
    const adapter = { friendlyId, participantId };
    const result = await this.meetingService.resJoinMeeting(adapter);

    return CoreApiResponse.success(result);
  }
}
