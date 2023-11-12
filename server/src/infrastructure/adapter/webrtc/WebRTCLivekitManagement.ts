import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
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
import { CreateAccessTokenPort } from "@core/domain/meeting/port/CreateAccessTokenPort";
import { ParticipantAccessToken, SendDataMessagePort } from "./Types";
import { ParticipantMetadataDTO } from "@core/domain/participant/usecase/dto/ParticipantMetadataDTO";

type _RoomClientService = Omit<
  RoomServiceClient,
  "getParticipant" | "createRoom" | "updateParticipants" | "sendData"
>;

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

  public get _roomServiceClient(): _RoomClientService {
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

  public async getParticipant(meetingId: string, participantId: string) {
    const p = await this.roomServiceClient
      .getParticipant(meetingId, participantId)
      .catch(() => null);
    if (!p) return null;
    const metadata = JSON.parse(p.metadata) as ParticipantMetadataDTO;
    return metadata;
  }

  public async createToken(
    port: CreateAccessTokenPort,
    metadata: ParticipantMetadataDTO,
  ) {
    const at = new AccessToken(this.livekitClientId, this.livekitClientSecret, {
      identity: port.participantId,
      name: port.participantName,
    });

    at.metadata = JSON.stringify(metadata);

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

  public async verifyToken(token: string) {
    const jwtVerify = new TokenVerifier(
      this.livekitClientId,
      this.livekitClientSecret,
    );

    const claimGrants = jwtVerify.verify(token);
    const { video, metadata } = claimGrants;
    if (!video || !metadata)
      throw new InternalServerErrorException("Verify token failed!");

    const metadataObject = JSON.parse(metadata) as ParticipantMetadataDTO;
    if (
      !metadataObject ||
      !metadataObject.id ||
      !metadataObject.role ||
      !metadataObject.meetingId
    )
      throw new InternalServerErrorException("Verify token failed!");

    const result: ParticipantAccessToken = {
      id: metadataObject.id,
      meetingId: metadataObject.meetingId,
      participantRole: metadataObject.role,
    };

    return result;
  }

  public async sendDataMessage(port: SendDataMessagePort) {
    const { meetingId, participantIds } = port.sendto;

    const encoder = new TextEncoder();
    const action = encoder.encode(JSON.stringify(port.action));

    const sendDataOptions: SendDataOptions = {
      destinationIdentities: participantIds,
    };

    return await this.roomServiceClient.sendData(
      meetingId,
      action,
      DataPacket_Kind.RELIABLE,
      sendDataOptions,
    );
  }
}
