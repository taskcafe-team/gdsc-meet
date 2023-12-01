import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";

import { HttpUserAuth } from "../auth/decorator/HttpUserAuth";
import {
  HttpDeleteMeetingsQueryModel,
  HttpMeetingParamModel,
  HttpRestApiModelCreateMeetingBody,
} from "./documentation/MeetingDocumentation";

import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { MeetingUsecaseDTO } from "@core/domain/meeting/usecase/dto/MeetingUsecaseDTO";
import { MeetingUsecase } from "@core/domain/meeting/usecase/MeetingUsecase";
import { MeetingService } from "@application/services/MeetingService";
import { HttpUserPayload } from "../auth/type/HttpAuthTypes";
import { HttpUser } from "../auth/decorator/HttpUser";

@Controller("meetings")
@ApiTags("meetings")
export class MeetingController {
  constructor(
    @Inject(MeetingService)
    private readonly meetingService: MeetingUsecase,
  ) {}

  @ApiBearerAuth()
  @ApiBody({ type: HttpRestApiModelCreateMeetingBody })
  @Post("")
  @HttpUserAuth()
  @HttpCode(HttpStatus.OK)
  public async createMeeting(
    @HttpUser() httpUser: HttpUserPayload,
    @Body() body: HttpRestApiModelCreateMeetingBody,
  ) {
    const dto = {
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      type: body.type,
    };
    const result = await this.meetingService.createMeeting(httpUser.id, dto);
    return CoreApiResponse.success(result);
  }

  @Get(":meetingId")
  @HttpUserAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getMeeting(
    @Param() param: HttpMeetingParamModel,
  ): Promise<CoreApiResponse<MeetingUsecaseDTO>> {
    const { meetingId } = param;
    const result = await this.meetingService.getMeetingById(meetingId);
    return CoreApiResponse.success(result);
  }

  @Get(":meetingId/rooms")
  @HttpCode(HttpStatus.OK)
  public async getMeetingRooms(@Param() param: HttpMeetingParamModel) {
    const { meetingId } = param;
    const result = await this.meetingService.getOrCreateMeetingRooms(meetingId);
    return CoreApiResponse.success(result);
  }

  @Get("")
  @HttpUserAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getMyMeetings(
    @HttpUser() httpUser: HttpUserPayload,
  ): Promise<CoreApiResponse<MeetingUsecaseDTO[]>> {
    const result = await this.meetingService.getMyMeetings(httpUser.id);
    return CoreApiResponse.success(result);
  }

  @Delete("")
  @HttpUserAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteMeetings(@Query() query: HttpDeleteMeetingsQueryModel) {
    const { ids } = query;
    const result = await this.meetingService.deleteMeetings(ids);
    return CoreApiResponse.success(result);
  }
}
