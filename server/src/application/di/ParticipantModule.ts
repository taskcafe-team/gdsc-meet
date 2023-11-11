import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { ConfigService } from "@nestjs/config";
import { ParticipantController } from "@application/api/http-rest/controller/ParticipantController";
import ParticipantService from "@core/services/participant/ParticipantService";
import { MeetingService } from "@core/services/meeting/MeetingService";
import { HttpParticipantRoleAuthGuard } from "@application/api/http-rest/auth/guard/HttpParticipantRoleAuthGuard";

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
