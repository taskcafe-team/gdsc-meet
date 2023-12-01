import {
  RoomServiceClient,
  AccessToken,
  TokenVerifier,
} from "livekit-server-sdk";
import { LivekitAccessTokenDTO } from "./dtos/LivekitCreateTokenDTO";

export abstract class WebRTCLivekitServiceBase {
  protected readonly _roomServiceClient: RoomServiceClient;
  protected readonly _livekitHost: string;
  protected readonly _livekitClientId: string;
  protected readonly _livekitClientSecret: string;

  get roomServiceClient(): RoomServiceClient {
    return this._roomServiceClient;
  }

  constructor(host: string, clientId: string, clientSecret: string) {
    this._livekitHost = host;
    this._livekitClientId = clientId;
    this._livekitClientSecret = clientSecret;
    this._roomServiceClient = new RoomServiceClient(
      host,
      clientId,
      clientSecret,
    );
  }

  protected createAccessToken<T = undefined>(
    payload: LivekitAccessTokenDTO<T>,
  ): string {
    const { identity, username } = payload;
    const metaObj = payload.metadata;
    const ttl = "2d"; //TODO: fix in production
    const metadata = metaObj ? JSON.stringify(metaObj) : undefined;
    const at = new AccessToken(
      this._livekitClientId,
      this._livekitClientSecret,
      { identity, name: username, ttl, metadata },
    );
    at.addGrant(payload.permissions);
    return at.toJwt();
  }

  protected verifyToken<T = undefined>(
    token: string,
  ): LivekitAccessTokenDTO<T> {
    const apiKey = this._livekitClientId;
    const apiSecret = this._livekitClientSecret;
    const jwtValidator = new TokenVerifier(apiKey, apiSecret);
    const claimGrants = jwtValidator.verify(token);
    const { video, metadata, name } = claimGrants;
    if (!video || !name) throw new Error("Invalid token");
    const metaObj = metadata ? JSON.parse(metadata) : undefined;

    return {
      identity: name,
      username: "I don't know",
      permissions: video,
      metadata: metaObj as T,
    };
  }
}
