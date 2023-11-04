import { Module } from "@nestjs/common";

import { UserService } from "@core/services/user/UserService";

import { InfrastructureModule } from "./InfrastructureModule";
import { UserController } from "@application/api/http-rest/controller/UserController";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [UserController],
  imports: [InfrastructureModule],
  providers: [ConfigService, UserService],
  exports: [UserService],
})
export class UserModule {}
