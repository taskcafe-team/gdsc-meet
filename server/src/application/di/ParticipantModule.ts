import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { ConfigService } from "@nestjs/config";
import { ParticipantController } from "@application/api/http-rest/controller/ParticipantController";

import { HttpParticipantRoleAuthGuard } from "@application/api/http-rest/auth/guard/HttpParticipantRoleAuthGuard";
import { MeetingService } from "@application/services/MeetingService";
import { ParticipantService } from "@application/services/ParticipantService";

@Module({
  controllers: [ParticipantController],
  imports: [InfrastructureModule],
  providers: [
    MeetingService,
    ConfigService,
    ParticipantService,
    HttpParticipantRoleAuthGuard,
  ],
  exports: [ParticipantService],
})
export class ParticipantModule {}
