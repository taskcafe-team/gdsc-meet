import { Module, Provider } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { MailerModule } from "@nestjs-modules/mailer";

import { NestHttpExceptionFilter } from "@application/api/http-rest/exception-filter/NestHttpExceptionFilter";

import { PrismaUnitOfWork } from "@infrastructure/adapter/persistence/prisma/unit-of-work/PrismaUnitOfWork";
import { PrismaService } from "@infrastructure/adapter/persistence/prisma/PrismaService";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";
import { PrismaUserRepositoryAdapter } from "@infrastructure/adapter/persistence/prisma/repository/PrismaUserRepositoryAdapter";

const providers: Provider[] = [
  PrismaService,
  PrismaUserRepositoryAdapter,
  {
    provide: UnitOfWork,
    useClass: PrismaUnitOfWork,
  },
  {
    provide: APP_FILTER,
    useClass: NestHttpExceptionFilter,
  },
];

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariablesConfig>,
      ) => ({
        transport: {
          host: configService.get("EMAIL_HOST"),
          port: configService.get("EMAIL_PORT"),
          auth: {
            user: configService.get("EMAIL_AUTH_USER"),
            pass: configService.get("EMAIL_AUTH_USER_PASSWORD"),
          },
        },
      }),
    }),
  ],
  providers: [...providers],
  exports: [PrismaService, UnitOfWork],
})
export class InfrastructureModule {}
