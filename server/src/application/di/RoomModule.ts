import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./InfrastructureModule";
import { RoomService } from "@application/services/RoomService";
import { RoomController } from "@application/api/http-rest/controller/RoomController";

@Module({
  controllers: [RoomController],
  imports: [InfrastructureModule],
  providers: [RoomService],
})
export class RoomModule {}
