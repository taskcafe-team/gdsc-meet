import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";

import { AuthModule } from "./AuthModule";
import { InfrastructureModule } from "./InfrastructureModule";
import { MeetingModule } from "./MeetingModule";
import { UserModule } from "./UserModule";
import { ParticipantModule } from "./ParticipantModule";
import { RoomModule } from "./RoomModule";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "env/local.dev.env",
      validate: EnvironmentVariablesConfig.validate,
    }),
    InfrastructureModule,
    AuthModule,
    UserModule,
    MeetingModule,
    ParticipantModule,
    RoomModule,
  ],
  providers: [],
  exports: [],
})
export class RootModule {}
