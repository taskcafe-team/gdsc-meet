import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { JwtModule } from "@nestjs/jwt";
import { MeetingController } from "@application/api/http-rest/controller/MeetingController";
import { UserModule } from "./UserModule";
import { MeetingService } from "@application/services/MeetingService";
import { UserMeetingService } from "@application/services/UserMeetingService";
import { PrismaClient } from "@prisma/client";
import { UserService } from "@application/services/UserService";

@Module({
  controllers: [MeetingController],
  imports: [InfrastructureModule, UserModule, JwtModule],
  providers: [MeetingService],
})
export class MeetingModule { }
