import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { ConfigService } from "@nestjs/config";
import { ParticipantController } from "@application/api/http-rest/controller/ParticipantController";
import ParticipantService from "@core/services/participant/ParticipantService";
import { MeetingService } from "@core/services/meeting/MeetingService";
import { HttpParticipantRoleAuthGuard } from "@application/api/http-rest/auth/guard/HttpParticipantRoleAuthGuard";
import { UserMeetingService } from "@core/services/user-meeting/UserMeetingService";
import { FileManagementModule } from "./FileManagementModule";
import { PrismaClient } from "@prisma/client";


@Module({
  controllers: [ParticipantController],
  imports: [InfrastructureModule],
  providers: [
    UserMeetingService,
    MeetingService,
    ConfigService,
    ParticipantService,
    HttpParticipantRoleAuthGuard,
    PrismaClient
  ],
  exports: [ParticipantService],
})
export class ParticipantModule {}
