import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

import { AuthModule } from "./AuthModule";
import { InfrastructureModule } from "./InfrastructureModule";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "env/local.dev.env", // dùng để xác định đường dẫn đến đến file môi trường
      validate: EnvironmentVariablesConfig.validate, // dùng để xác thực các giá trị trong môi trường env/local.dev.env
    }),
    InfrastructureModule,
    AuthModule,
  ],
  providers: [],
  exports: [],
})
export class RootModule {}
