import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  AccessToken,
  Room,
  RoomServiceClient,
  VideoGrant,
} from "livekit-server-sdk";

@Injectable()
export class WebRTCLivekitService {
  private readonly livekitHost: string;
  private readonly livekitClientId: string;
  private readonly livekitClientSecret: string;

  private readonly roomServiceClient: RoomServiceClient;

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

  public async createToken(payload: {
    roomName: string;
    participantIdentity: string;
    participantName: string;
    roomJoin?: boolean;
    canPublish?: boolean;
    canSubscribe?: boolean;
  }): Promise<string> {
    const at = new AccessToken(this.livekitClientId, this.livekitClientSecret, {
      identity: payload.participantIdentity,
      name: payload.participantName,
    });

    const permissions: VideoGrant = {
      roomJoin: payload.roomJoin || true,
      room: payload.roomName,
      canPublish: payload.canPublish || true,
      canSubscribe: payload.canSubscribe || true,
    };

    at.addGrant(permissions);

    return at.toJwt();
  }
}
