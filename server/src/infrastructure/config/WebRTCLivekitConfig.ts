import { IsNotEmpty } from "class-validator";
import { env } from "process";

import { BaseConfig } from "./BaseConfig";

export class WebRTCLivekitConfig extends BaseConfig {
  @IsNotEmpty() WEBRTC_LIVEKIT_API_HOST = env.WEBRTC_LIVEKIT_API_HOST ?? "";
  @IsNotEmpty() WEBRTC_LIVEKIT_CLIENT_ID = env.WEBRTC_LIVEKIT_CLIENT_ID ?? "";
  @IsNotEmpty() WEBRTC_LIVEKIT_CLIENT_SECRET =
    env.WEBRTC_LIVEKIT_CLIENT_SECRET ?? "";
}
