import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import helmet from "helmet";

import { RootModule } from "./di/.RootModule";
import { ConfigService } from "@nestjs/config";

import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

export class ServerApplication {
  public async run(): Promise<void> {
    const app: NestExpressApplication = await NestFactory.create(RootModule);
    const configService: ConfigService<EnvironmentVariablesConfig> =
      app.get(ConfigService);

    app.use(helmet());
    this.buildAPIDocumentation(app);
    this.buildCORS(app);

    await app.listen(configService.get("API_PORT") || 3000, () => {
      this.log(app);
    });
  }

  private buildAPIDocumentation(app: NestExpressApplication): void {
    const whileList: string[] = ["development"];
    if (!whileList.includes(process.env.NODE_ENV?.trimEnd() || "")) return;

    const configService: ConfigService<EnvironmentVariablesConfig> =
      app.get(ConfigService);

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
        name: configService.get("API_ACCESS_TOKEN_HEADER"),
      })
      .build();

    const document: OpenAPIObject = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("documentation", app, document);
  }

  private buildCORS(app: NestExpressApplication): void {
    const configService: ConfigService<EnvironmentVariablesConfig> =
      app.get(ConfigService);
    app.enableCors({
      origin: configService.get("API_CORS_ORIGIN"),
      credentials: true,
      methods: configService.get("API_CORS_METHOD"),
    });
  }

  private log(app: NestExpressApplication): void {
    const configService: ConfigService<EnvironmentVariablesConfig> =
      app.get(ConfigService);

    const host = configService.get("API_HOST");
    const port = configService.get("API_PORT");
    const context = ServerApplication.name;
    Logger.log(`Server started on: ${host}:${port}/documentation`, context);
  }

  public static new(): ServerApplication {
    return new ServerApplication();
  }
}
