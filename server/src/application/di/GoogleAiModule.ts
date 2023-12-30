import { GoogleAiController } from '@application/api/http-rest/controller/GoogleAiController';
import { GoogleAiService } from '@application/services/GoogleAiService';
import { Module } from '@nestjs/common';


@Module({
  imports: [],
  controllers: [GoogleAiController],
  providers: [GoogleAiService],
})
export class GoogleAiModule {}
