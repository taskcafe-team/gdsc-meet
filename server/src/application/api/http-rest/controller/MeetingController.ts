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
  Put,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";

import { HttpUserAuth } from "../auth/decorator/HttpUserAuth";
import { HttpRestApiModelCreateMeetingBody } from "./documentation/MeetingDocumentation";

import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { MeetingUsecaseDto } from "@core/domain/meeting/usecase/dto/MeetingUsecaseDto";
import { MeetingUsecase } from "@core/domain/meeting/usecase/MeetingUsecase";
import { MeetingService } from "@application/services/MeetingService";
import { HttpUserPayload } from "../auth/type/HttpAuthTypes";
import { HttpUser } from "../auth/decorator/HttpUser";
import { Meeting } from "@core/domain/meeting/entity/Meeting";
import { instanceToPlain, plainToClass } from "class-transformer";

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

  @Get("")
  @HttpUserAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getMyMeetings(
    @HttpUser() httpUser: HttpUserPayload,
  ): Promise<CoreApiResponse<MeetingUsecaseDto[]>> {
    const result = await this.meetingService.getMyMeetings(httpUser.id);
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
    const result = await this.meetingService.deleteMeetings(ids);
    return CoreApiResponse.success(result);
  }

  @Get(":meetingId")
  @HttpUserAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getMeeting(
    @Param("meetingId") meetingId: string,
  ): Promise<CoreApiResponse<MeetingUsecaseDto>> {
    const result = await this.meetingService.getMeetingById(meetingId);
    return CoreApiResponse.success(result);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(":meetingId")
  public async updateMeeting(
    @Param("meetingId") meetingId: string,
    // @Body() updateMeetingDto: {},
  ): Promise<CoreApiResponse> {
    throw new Error("Method not implemented.");
    // const adapter = {};
    // await this.meetingService.updateMeeting(adapter, meetingId, {});
    // return CoreApiResponse.success(undefined, HttpStatus.NO_CONTENT);
  }
}
