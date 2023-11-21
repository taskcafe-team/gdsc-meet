import { MeetingService } from "@core/services/meeting/MeetingService";
import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { JwtModule } from "@nestjs/jwt";
import { MeetingController } from "@application/api/http-rest/controller/MeetingController";
import { UserModule } from "./UserModule";
import { UserMeetingService } from "@core/services/user-meeting/UserMeetingService";
import { PrismaClient } from "@prisma/client";

@Module({
  controllers: [MeetingController],
  imports: [InfrastructureModule, JwtModule, UserModule],
  providers: [MeetingService, UserMeetingService,PrismaClient],
})
export class MeetingModule { }
