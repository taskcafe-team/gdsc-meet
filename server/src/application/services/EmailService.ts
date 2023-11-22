import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private readonly emailAuthUser: string;

  constructor(
    configService: ConfigService<EnvironmentVariablesConfig, true>,
    private readonly mailerService: MailerService,
  ) {
    this.emailAuthUser = configService.get("EMAIL_AUTH_USER");
  }

  async sendEmail(to: string, subject: string, body: string) {
    return await this.mailerService.sendMail({
      to,
      from: this.emailAuthUser,
      subject,
      text: "welcome",
      html: body,
    });
  }
}
