import { Module } from "@nestjs/common";

import { UserService } from "@core/services/user/UserService";

import { InfrastructureModule } from "./InfrastructureModule";
import { UserController } from "@application/api/http-rest/controller/UserController";

@Module({
  controllers: [UserController],
  imports: [InfrastructureModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
