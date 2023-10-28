import { Module } from "@nestjs/common";

import { UserService } from "@core/services/user/UserService";

import { InfrastructureModule } from "./InfrastructureModule";
import { UserController } from "@application/api/http-rest/controller/UserController";
import { FirebaseService } from "@core/services/firebase/FirebaseService";

@Module({
  controllers: [UserController],
  imports: [InfrastructureModule],
  providers: [UserService,FirebaseService],
  exports: [UserService],
})
export class UserModule {}
