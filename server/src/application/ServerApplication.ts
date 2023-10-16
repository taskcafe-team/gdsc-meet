import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import helmet from "helmet";

import { RootModule } from "./di/.RootModule";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

export class ServerApplication {
  
  // Class ConfigService thường dùng để quản lý các cấu hình trong ứng dụng
  // Nó cung cấp các phương thức để truy cập từ các nguồn cấu hình khác như biến môi trường. 
  // Kiểu dữ liệu env là EnvironmentVariablesConfig và các giá trị cấu hình là bắt buộc
  private configService: ConfigService<EnvironmentVariablesConfig, true>;

  // NestExpressApplication là một lớp dùng để truy cập vào các phương thức và tính năng của Express như middle, routing, xử lý yêu cầu HTTP
  private app: NestExpressApplication; // dùng để lưu trữ ứng dụng nestjs được khởi tạo

  public async run(): Promise<void> {
    // dùng để tạo ra một phiên bản của ứng dụng nestjs với RootModule là module gốc của dự án
    this.app = await NestFactory.create(RootModule); 
    
    // cho phép ta truy cập vào ConfigService đã được cấu hình
    this.configService = this.app.get(ConfigService); 
    //console.log("configService" + JSON.stringify(this.configService))
    
    this.app.use(helmet()); // sử dụng một middleware là helmet (một middleware về bảo mật)
    this.buildAPIDocumentation(); // dùng để tải cấu hình tài liệu API cho ứng dụng
    this.buildCORS(); // dùng để tải cấu hình CORS cho ứng dụng

    // cấu hình cổng lắng nghe các yêu cầu đến. Hàm call back this.log() dùng để thực hiện các hành động ghi nhật ký khi máy chủ khởi động
    await this.app.listen(this.configService.get("API_PORT"), () => this.log()); 
  }

  // Phương thức buildAPIDocumentation dùng để xây dựng tài liệu API
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
    Logger.log(`Server started on: http://${host}:${port}`, context);
    console.log(port + "   " + host)
  }

  // Phương thức dùng để trả về một đối tương
  public static new(): ServerApplication {
    return new ServerApplication();
  }
}
