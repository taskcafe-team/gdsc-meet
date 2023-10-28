import { LivekitController } from '@application/api/http-rest/controller/LivekitController';
import { GenerateLivekitJWT } from '@infrastructure/adapter/usecase/webrtc/livekit/GenerateLivekitJWT';
import { Module } from '@nestjs/common';
import { InfrastructureModule } from './InfrastructureModule';
import { ConfigService } from '@nestjs/config';

@Module({
    controllers: [LivekitController],
    imports: [InfrastructureModule],
    providers: [GenerateLivekitJWT,ConfigService],
    exports: [GenerateLivekitJWT],
  })
export class LivekitModule {}
