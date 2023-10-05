import { Module, Scope } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { MailerModule } from "@nestjs-modules/mailer";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";

import { NestHttpExceptionFilter } from "@application/api/http-rest/exception-filter/NestHttpExceptionFilter";

import { PrismaUnitOfWork } from "@infrastructure/adapter/persistence/prisma/unit-of-work/PrismaUnitOfWork";
import { PrismaService } from "@infrastructure/adapter/persistence/prisma/PrismaService";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { PrismaUserRepositoryAdapter } from "@infrastructure/adapter/persistence/prisma/repository/PrismaUserRepositoryAdapter";

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      // Mailer Module dùng để cấu hình và gửi email, nó được sử dụng để gửi email trong ứng dụng.
      // forRootAsync là một phương thức được sử dụng để động cấu hình một module.
      // Nó thường được sử dụng khi cần đọc và xử lý cấu hình trước khi cung cấp nó cho module.
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
  providers: [
    PrismaService, //dịch vụ cho việc tương tác với cơ sở dữ liệu thông qua Prisma
    PrismaUserRepositoryAdapter, //Một adapter, custom lại các hàm trong repository của prisma cung cấp
    {
      provide: UnitOfWork,
      //UnitOfWork là một provider có thể được sử dụng để quản lý các thay đổi trong cơ sở dữ liệu.
      useClass: PrismaUnitOfWork,
      //Trong trường hợp này, nó được cung cấp thông qua PrismaUnitOfWork.
    },
    {
      provide: APP_FILTER,
      useClass: NestHttpExceptionFilter, //xử lý các ngoại lệ HTTP
    },
  ],
  exports: [UnitOfWork], //export để quản lý các database transactions
})
export class InfrastructureModule {}
