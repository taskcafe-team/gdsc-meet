import { Module, Provider, Scope } from "@nestjs/common";
import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { PrismaUnitOfWork } from "@infrastructure/adapter/persistence/prisma/unit-of-work/PrismaUnitOfWork";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@infrastructure/adapter/persistence/prisma/PrismaService";

const UnitOfWorkProvider: Provider = {
  provide: UnitOfWork,
  useClass: PrismaUnitOfWork,
  scope: Scope.REQUEST,
};

const PrismaServiceProvider: Provider = {
  provide: PrismaService,
  useClass: PrismaService,
  scope: Scope.DEFAULT,
};

@Module({
  providers: [ConfigService, PrismaServiceProvider, UnitOfWorkProvider],
  exports: [UnitOfWorkProvider],
})
export class UnitOfWorkModule {}
