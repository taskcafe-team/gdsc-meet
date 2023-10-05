import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

import { AuthModule } from "./AuthModule";
import { InfrastructureModule } from "./InfrastructureModule";

@Module({
  imports: [
    //một class được cấp bởi thư viện @nestjs/config dùng để config biến môi trường (env)
    //thư viện này phải cài chứ không có sẵn khi tạo dự án
    ConfigModule.forRoot({
      envFilePath: "env/local.dev.env",
      validate: EnvironmentVariablesConfig.validate, //truyền hàm validate được viết trong EnvironmentVariablesConfig vào
    }),
    InfrastructureModule,
    AuthModule,
  ],
  providers: [],
  exports: [],
})
export class RootModule {}
