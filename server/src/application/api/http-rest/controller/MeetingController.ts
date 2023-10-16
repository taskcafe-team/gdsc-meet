import { MeetingService } from "@core/services/meeting/MeetingService";
import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { HttpAuth } from "../auth/decorator/HttpAuth";
import { HttpUserPayload } from "../auth/type/HttpAuthTypes";
import { CoreApiResponse } from "@core/common/api/CoreApiResponse";
import { HttpUser } from "../auth/decorator/HttpUser";

@Controller("meeting")
@ApiTags("meeting")
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Get("")
  @HttpAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async createMeeting(@HttpUser() httpUser: HttpUserPayload) {
    const result = await this.meetingService.createMeeting({
      currentUserId: httpUser.id,
    });
    return CoreApiResponse.success(result);
  }

  @Get(":friendlyId")
  @HttpAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getMeeting(@Param("friendlyId") friendlyId: string) {
    const adapter = { friendlyId };
    const result = await this.meetingService.getMeeting(adapter);
    return CoreApiResponse.success(result);
  }

  @Get(":friendlyId/access-token")
  @HttpAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public async getAccessToken(
    @Param("friendlyId") friendlyId: string,
    @HttpUser() httpUser: HttpUserPayload,
  ) {
    const adapter = { friendlyId, currentUserId: httpUser.id };
    const result = await this.meetingService.getAccessToken(adapter);
    return CoreApiResponse.success(result);
  }
}
