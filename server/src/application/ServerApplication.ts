import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import helmet from "helmet";

import { RootModule } from "./di/.RootModule";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

export class ServerApplication {
  private configService: ConfigService<EnvironmentVariablesConfig, true>; //Config cho biến môi trường, vào EnvironmentVariablesConfig để xem chi tiết
  private app: NestExpressApplication;

  public async run(): Promise<void> {
    //this ở đây đại diện cho ServerApplication
    this.app = await NestFactory.create(RootModule);
    // tạo một phiên bản ứng dụng Nest.js dựa trên module gốc (RootModule).
    // RootModule thường là module chính của ứng dụng,
    //nơi định nghĩa các thiết lập chung cho ứng dụng, bao gồm cả các controllers, providers và configuration.
    this.configService = this.app.get(ConfigService);
    //get là hàm được cung cấp bởi NestExpressApplication được sử dụng để truy cập các dịch vụ
    //đã đăng ký trong hệ thống Dependency Injection của Nest.js.

    this.app.use(helmet());
    this.buildAPIDocumentation();
    this.buildCORS();

    await this.app.listen(this.configService.get("API_PORT"), () => this.log());
  }

  private buildAPIDocumentation(): void {
    const whileList: string[] = ["development"]; //chỉ chạy documentation trong môi trường development
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
        //get là một phương thức chung được sử dụng để truy xuất các thành phần được quản lý
        //bởi hệ thống Dependency Injection của NestJS.
      })
      .build();

    const document: OpenAPIObject = SwaggerModule.createDocument(
      this.app,
      options,
    );
    SwaggerModule.setup("documentation", this.app, document);
    //tham số đầu tiên là route (/documentation) để mở được document đc xây dựng bởi swagger
    //tham số thứ 2 là ứng dụng NestJS, được tạo bởi NestFactory.create
    //(có thể đọc và xử lý HTTP request/response)
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
    Logger.log(`Server started on: http://${host}:${port}`, context);
    Logger.log(
      `You can visit documentation on: http://${host}:${port}/documentation`,
      context,
    );
  }

  public static new(): ServerApplication {
    return new ServerApplication();
  }
}
