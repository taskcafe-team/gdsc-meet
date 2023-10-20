import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  HttpException,
  HttpStatus,
  Logger,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common";
import helmet from "helmet";

import { RootModule } from "./di/.RootModule";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

export class ServerApplication {
  private configService: ConfigService<EnvironmentVariablesConfig, true>;
  private app: NestExpressApplication;

  public async run(): Promise<void> {
    this.app = await NestFactory.create(RootModule);
    this.configService = this.app.get(ConfigService);

    this.app.use(helmet());
    this.buildValidatorPipe();
    this.buildAPIDocumentation();
    this.buildCORS();

    await this.app.listen(this.configService.get("API_PORT"), () => this.log());
  }

  private buildValidatorPipe(): void {
    this.app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory(errors: ValidationError[]) {
          const message = errors
            .map((err) => Object.values(err.constraints || ""))
            .join("\n");

          return new HttpException(message, HttpStatus.BAD_REQUEST);
        },
      }),
    );
  }

  private buildAPIDocumentation(): void {
    const whileList: string[] = ["development"];
    if (!whileList.includes(this.configService.get("NODE_ENV"))) return;

    const title = "IPoster";
    const description = "IPoster API documentation";
    const version = "1.0.0";

    const options: Omit<OpenAPIObject, "paths"> = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version)
      .addBearerAuth({
        type: "apiKey",
        in: "header",
        name: this.configService.get("API_ACCESS_TOKEN_HEADER"),
      })
      .build();

    const document: OpenAPIObject = SwaggerModule.createDocument(
      this.app,
      options,
    );
    SwaggerModule.setup("documentation", this.app, document);
  }

  private buildCORS(): void {
    this.app.enableCors({
      origin: this.configService.get("API_CORS_ORIGIN"),
      credentials: true,
      methods: this.configService.get("API_CORS_METHOD"),
    });
  }

  private log(): void {
    const host = this.configService.get("API_HOST");
    const port = this.configService.get("API_PORT");
    const context = ServerApplication.name;
    Logger.log(
      `Server started on: http://${host}:${port}/documentation`,
      context,
    );
  }

  public static new(): ServerApplication {
    return new ServerApplication();
  }
}
