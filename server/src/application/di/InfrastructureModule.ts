import { Module, Provider } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { MailerModule } from "@nestjs-modules/mailer";

import { NestHttpExceptionFilter } from "@application/api/http-rest/exception-filter/NestHttpExceptionFilter";

import { PrismaUnitOfWork } from "@infrastructure/adapter/persistence/prisma/unit-of-work/PrismaUnitOfWork";
import { PrismaService } from "@infrastructure/adapter/persistence/prisma/PrismaService";

import { CommonDITokens } from "@core/common/DIToken/CommonDITokens";

const providers: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: NestHttpExceptionFilter,
  },
  {
    provide: CommonDITokens.UnitOfWork,
    useClass: PrismaUnitOfWork,
  },
  PrismaService,
];

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRoot({
      transport: {
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: "alison30@ethereal.email",
          pass: "heyMGBAGdkpHKwfzNB",
        },
      },
    }),
  ],
  providers: [...providers],
  exports: [CommonDITokens.UnitOfWork, PrismaService],
})
export class InfrastructureModule {}
