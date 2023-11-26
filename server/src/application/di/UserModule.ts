import { Module } from "@nestjs/common";

import { InfrastructureModule } from "./InfrastructureModule";
import { UserController } from "@application/api/http-rest/controller/UserController";
import { UserService } from "@application/services/UserService";
import { MeetingService } from "@application/services/MeetingService";
import { UserMeetingService } from "@application/services/UserMeetingService";

@Module({
  controllers: [UserController],
  imports: [InfrastructureModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
