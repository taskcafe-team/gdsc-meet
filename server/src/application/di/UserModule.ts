import { Module } from "@nestjs/common";

import { UserService } from "@core/services/user/UserService";

import { InfrastructureModule } from "./InfrastructureModule";
import { UserController } from "@application/api/http-rest/controller/UserController";
import { PrismaService } from "@infrastructure/adapter/persistence/prisma/PrismaService";

@Module({
  controllers: [UserController],
  imports: [InfrastructureModule],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
