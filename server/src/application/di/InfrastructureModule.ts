import { CacheModule } from "@nestjs/cache-manager";
import { Module, Provider } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { MailerModule } from "@nestjs-modules/mailer";

import { NestHttpExceptionFilter } from "@application/api/http-rest/exception-filter/NestHttpExceptionFilter";

import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { WebRTCModule } from "./Infrastructure/WebRTCModule";
import { UnitOfWorkModule } from "./Infrastructure/UnitOfWorkModule";
import { RedisModule } from "@infrastructure/adapter/persistence/redis/RedisModule";

const NestHttpExceptionFilterProvider: Provider = {
  provide: APP_FILTER,
  useClass: NestHttpExceptionFilter,
};

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
    CacheModule.register({ isGlobal: true }),
    UnitOfWorkModule,
    WebRTCModule,
    RedisModule,
  ],
  providers: [NestHttpExceptionFilterProvider],
  exports: [
    MailerModule,
    CacheModule,
    UnitOfWorkModule,
    WebRTCModule,
    RedisModule,
  ],
})
export class InfrastructureModule {}
