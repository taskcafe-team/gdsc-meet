import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseArrayPipe,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";

import { HttpUserAuth } from "../auth/decorator/HttpUserAuth";
import { HttpRestApiModelCreateMeetingBody } from "./documentation/MeetingDocumentation";

import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { MeetingUsecaseDto } from "@core/domain/meeting/usecase/dto/MeetingUsecaseDto";
import { MeetingUsecase } from "@core/domain/meeting/usecase/MeetingUsecase";
import { MeetingService } from "@application/services/MeetingService";

@Controller("meetings")
@ApiTags("meetings")
export class MeetingController {
  constructor(
    @Inject(MeetingService)
    private readonly meetingService: MeetingUsecase,
  ) {}

  @Post("")
  @HttpUserAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: HttpRestApiModelCreateMeetingBody })
  public async createMeeting(@Body() body: HttpRestApiModelCreateMeetingBody) {
    const adapter = {
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      type: body.type,
    };
    const result = await this.meetingService.createMeeting(adapter);
    return CoreApiResponse.success(result);
  }

  @Get("")
  @HttpUserAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getMyMeetings() {
    const result = await this.meetingService.getMyMeetings();
    return CoreApiResponse.success(result);
  }

  @Delete("")
  @HttpUserAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteMeetings(
    @Query("ids", new ParseArrayPipe({ items: String, separator: "," }))
    ids: string[],
  ) {
    const result = await this.meetingService.deleteMeetings({ ids });
    return CoreApiResponse.success(result);
  }

  @Get(":meetingId")
  @HttpUserAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getMeeting(
    @Param("meetingId") meetingId: string,
  ): Promise<CoreApiResponse<MeetingUsecaseDto>> {
    const adapter = { meetingId };
    const result = await this.meetingService.getMeeting(adapter);
    return CoreApiResponse.success(result);
  }
}
