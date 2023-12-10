import { CacheModule } from "@nestjs/cache-manager";
import { Module, Provider } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { MailerModule } from "@nestjs-modules/mailer";
import * as redisStore from "cache-manager-redis-store";

import { NestHttpExceptionFilter } from "@application/api/http-rest/exception-filter/NestHttpExceptionFilter";

import { WebRTCModule } from "./WebRTCModule";
import { UnitOfWorkModule } from "./UnitOfWorkModule";
import { CustomJwtService } from "@application/services/JwtService";
import { EmailService } from "@application/services/EmailService";
import { JwtModule } from "@nestjs/jwt";
import { MailServiceConfig } from "@infrastructure/config/MailServiceConfig";
import { RedisConfig } from "@infrastructure/config/RedisConfig";

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
      useFactory: (configService: ConfigService<MailServiceConfig>) => ({
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
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<RedisConfig>) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.get("REDIS_HOST"),
        port: configService.get("REDIS_PORT"),
        auth_pass: configService.get("REDIS_PASS"),
      }),
    }),
    UnitOfWorkModule,
    WebRTCModule,
    JwtModule,
  ],
  providers: [
    ConfigService,
    NestHttpExceptionFilterProvider,
    CustomJwtService,
    EmailService,
  ],
  exports: [
    ConfigService,
    MailerModule,
    CacheModule,
    UnitOfWorkModule,
    WebRTCModule,
    CustomJwtService,
    EmailService,
  ],
})
export class InfrastructureModule {}
