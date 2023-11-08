import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  AccessToken,
  DataPacket_Kind,
  Room,
  RoomServiceClient,
  SendDataOptions,
  TokenVerifier,
  VideoGrant,
} from "livekit-server-sdk";
import { SendMessagePayload } from "./Types";
import { CreateAccessTokenPort } from "@core/domain/meeting/port/CreateAccessTokenPort";

@Injectable()
export class WebRTCLivekitService {
  private readonly livekitHost: string;
  private readonly livekitClientId: string;
  private readonly livekitClientSecret: string;

  private readonly roomServiceClient: RoomServiceClient;

  private readonly emptyTimeout: number = 100;
  private readonly maxParticipants: number = 100;

  constructor(configService: ConfigService<EnvironmentVariablesConfig, true>) {
    this.livekitHost = configService.get("WEBRTC_LIVEKIT_API_HOST");
    this.livekitClientId = configService.get("WEBRTC_LIVEKIT_CLIENT_ID");
    this.livekitClientSecret = configService.get(
      "WEBRTC_LIVEKIT_CLIENT_SECRET",
    );

    this.roomServiceClient = new RoomServiceClient(
      this.livekitHost,
      this.livekitClientId,
      this.livekitClientSecret,
    );
  }

  public get _roomServiceClient() {
    return this.roomServiceClient;
  }

  public async updateParticipants(port: { room: string; identity: string }) {
    const { room, identity } = port;
    return await this.roomServiceClient.updateParticipant(room, identity);
  }

  public async createRoom(port: {
    name: string;
    emptyTimeout?: number;
    maxParticipants?: number;
  }) {
    const room: Room = await this.roomServiceClient.createRoom({
      name: port.name,
      emptyTimeout: port.emptyTimeout || this.emptyTimeout,
      maxParticipants: port.maxParticipants || this.maxParticipants,
    });

    return room;
  }

  public async getParticipant(meetingId, participantId) {
    return this._roomServiceClient.getParticipant(meetingId, participantId);
  }

  public createToken<T>(port: CreateAccessTokenPort, metadata?: T): string {
    const at = new AccessToken(this.livekitClientId, this.livekitClientSecret, {
      identity: port.participantId,
      name: port.participantName,
    });

    if (metadata) at.metadata = JSON.stringify(metadata);

    const permissions: VideoGrant = {
      room: port.meetingId,
      roomJoin: port.roomJoin || undefined,
      canPublish: port.canPublish || undefined,
      canSubscribe: port.canSubscribe || undefined,
      roomList: port.roomList || undefined,
      roomCreate: port.roomCreate || undefined,
      canPublishData: port.canPublishData || undefined,
      hidden: port.hidden || undefined,
    };

    at.addGrant(permissions);
    return at.toJwt();
  }

  public verifyToken<T>(token: string) {
    try {
      const jwtVerify = new TokenVerifier(
        this.livekitClientId,
        this.livekitClientSecret,
      );

      const claimGrants = jwtVerify.verify(token);

      const result = {
        meetingId: claimGrants.name,
        videoGrant: claimGrants.video,
        metadata: claimGrants.metadata
          ? (JSON.parse(claimGrants.metadata) as T)
          : undefined,
      };
      return result;
    } catch (error) {
      return null;
    }
  }

  public async sendMessage<T>(message: SendMessagePayload<T>) {
    const { meetingId, participantIds } = message.sendto;
    let data: Uint8Array = new Uint8Array();

    if (message.payload) {
      const encoder = new TextEncoder();
      data = encoder.encode(JSON.stringify(message.payload));
    }

    const sendDataOptions: SendDataOptions = {
      destinationIdentities: participantIds,
    };

    return await this.roomServiceClient.sendData(
      meetingId,
      data,
      DataPacket_Kind.RELIABLE,
      sendDataOptions,
    );
  }
}
