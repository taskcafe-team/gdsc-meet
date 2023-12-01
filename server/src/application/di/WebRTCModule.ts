import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitService";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [ConfigModule, JwtModule],
  providers: [WebRTCLivekitService],
  exports: [WebRTCLivekitService],
})
export class WebRTCModule {}
