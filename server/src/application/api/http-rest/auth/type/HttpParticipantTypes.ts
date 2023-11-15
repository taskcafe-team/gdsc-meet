import { AccessTokenMetadata } from "@infrastructure/adapter/webrtc/Types";
import { Request } from "express";

export type HttpRequestWithParticipant = Request & {
  participant?: AccessTokenMetadata;
};
