import { MeetingService } from "@core/services/meeting/MeetingService";
import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { JwtModule } from "@nestjs/jwt";
import { MeetingController } from "@application/api/http-rest/controller/MeetingController";
import { UserModule } from "./UserModule";

@Module({
  controllers: [MeetingController],
  imports: [InfrastructureModule, JwtModule, UserModule],
  providers: [MeetingService],
})
export class MeetingModule {}
