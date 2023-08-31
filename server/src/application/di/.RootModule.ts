import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { EnvironmentEnums } from "@core/common/enums/EnvironmentEnums";
import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { CoreAssert } from "@core/common/util/assert/CoreAssert";

import { AuthModule } from "./AuthModule";
import { InfrastructureModule } from "./InfrastructureModule";

export const getEnvFilePath = (nodeEnvString: string): string => {
  const envFilePath: { [key in EnvironmentEnums]: string } = {
    [EnvironmentEnums.Development]: "env/local.dev.env",
    [EnvironmentEnums.Production]: "env/local.prod.env",
  };

  const nodeEnvEnum: EnvironmentEnums = nodeEnvString as EnvironmentEnums;
  CoreAssert.notEmpty(
    nodeEnvEnum,
    new Error(`NODE_ENV=${nodeEnvString} is not a valid`),
  );

  const filePath: string = envFilePath[nodeEnvEnum];
  return filePath;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV
        ? getEnvFilePath(process.env.NODE_ENV.trim())
        : "",
      validate: EnvironmentVariablesConfig.validate,
    }),
    InfrastructureModule,
    AuthModule,
  ],
  exports: [],
})
export class RootModule {}
