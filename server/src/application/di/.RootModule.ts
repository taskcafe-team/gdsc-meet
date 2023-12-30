import { Injectable, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./AuthModule";
import { InfrastructureModule } from "./InfrastructureModule";
import { MeetingModule } from "./MeetingModule";
import { UserModule } from "./UserModule";
import { ParticipantModule } from "./ParticipantModule";
import { RoomModule } from "./RoomModule";
import { AppConfig } from "@infrastructure/config/AppConfig";
import { BaseConfig } from "@infrastructure/config/BaseConfig";
import { FileStorageConfig } from "@infrastructure/config/FileStorageConfig";
import { DatabaseConfig } from "@infrastructure/config/DatabaseConfig";
import { WebRTCLivekitConfig } from "@infrastructure/config/WebRTCLivekitConfig";
import { MailServiceConfig } from "@infrastructure/config/MailServiceConfig";
import { GoogleServiceConfig } from "@infrastructure/config/GoogleServiceConfig";
import { RedisConfig } from "@infrastructure/config/RedisConfig";
import { GoogleAiModule } from "./GoogleAiModule";
import { FileManagementModule } from "./FileManagementModule";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      expandVariables: true,
      load: BaseConfig.getConfig(
        AppConfig,
        DatabaseConfig,
        FileStorageConfig,
        WebRTCLivekitConfig,
        GoogleServiceConfig,
        MailServiceConfig,
        RedisConfig,
      ),
    }),
    InfrastructureModule,
    AuthModule,
    UserModule,
    MeetingModule,
    ParticipantModule,
    RoomModule,
    GoogleAiModule,
    FileManagementModule
  ],
})
export class RootModule {}
