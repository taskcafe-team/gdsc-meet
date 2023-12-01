import { VideoGrant } from "livekit-server-sdk";

export type LivekitAccessTokenDTO<T> = {
  identity: string;
  username: string;
  permissions: VideoGrant;
  metadata: T;
};
