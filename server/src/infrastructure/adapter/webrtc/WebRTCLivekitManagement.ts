import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  AccessToken,
  DataPacket_Kind,
  Room,
  RoomServiceClient,
  TrackSource,
  VideoGrant,
  WebhookReceiver,
} from "livekit-server-sdk";

@Injectable()
export class WebRTCLivekitService {
  private readonly livekitHost: string;
  private readonly livekitClientId: string;
  private readonly livekitClientSecret: string;

  private readonly roomServiceClient: RoomServiceClient;
  private readonly webhookReceiver: WebhookReceiver;

  private readonly emptyTimeout: number = 100;
  private readonly maxParticipants: number = 100;

  constructor(
    configService: ConfigService<EnvironmentVariablesConfig, true>,
    private readonly jwtService: JwtService,
  ) {
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
    this.webhookReceiver = new WebhookReceiver(
      this.livekitClientId,
      this.livekitClientSecret,
    );
  }

  public async sendData(roomId: string, participantId: string, data?: string) {
    const p = await this.roomServiceClient
      .getParticipant(roomId, participantId)
      .catch(() => null);

    if (!p) return;

    const encoder = new TextEncoder();
    const dataEncode = encoder.encode(data);

    await this.roomServiceClient.sendData(
      roomId,
      dataEncode,
      DataPacket_Kind.RELIABLE,
      [p.sid],
    );
  }

  public getRoomServiceClient() {
    return this.roomServiceClient;
  }

  public async updateParticipants(port: { room: string; identity: string }) {
    const { room, identity } = port;
    return await this.roomServiceClient.updateParticipant(room, identity);
  }

  public async listRooms(): Promise<Room[]> {
    return this.roomServiceClient.listRooms();
  }

  public async deleteRoom(port: { name: string }): Promise<void> {
    await this.roomServiceClient.deleteRoom(port.name);
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

  public async createToken(
    payload: {
      roomName: string;
      participantIdentity: string;
      participantName: string;
      roomJoin?: boolean;
      canPublish?: boolean;
      canSubscribe?: boolean;
      roomList?: boolean;
      roomCreate?: boolean;
      canPublishSources?: TrackSource[];
      canPublishData?: boolean;
      hidden?: boolean;
    },
    data?: string,
  ): Promise<string> {
    const at = new AccessToken(this.livekitClientId, this.livekitClientSecret, {
      identity: payload.participantIdentity,
      name: payload.participantName,
    });

    if (data !== undefined) at.metadata = data;

    const permissions: VideoGrant = {
      ...payload,
      canUpdateOwnMetadata: false,
    };

    at.addGrant(permissions);

    return at.toJwt();
  }
}
