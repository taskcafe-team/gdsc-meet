import { EnvironmentVariablesConfig } from "@infrastructure/config/EnvironmentVariablesConfig";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateRoomPort } from "@core/domain/room/usecase/ports/CreateRoomPort";
import { LivekitRoomMetadata } from "./types/LivekitRoomMetadata";
import { LivekitRoomMapper } from "./mappers/LivekitRoomMapper";
import { Room as CoreRoom } from "@core/domain/room/entity/Room";
import { WebRTCLivekitServiceBase } from "./WebRTCLivekitServiceBase";
import { ParticipantAccessTokenDTO } from "@core/domain/participant/usecase/dto/ParticipantAccessTokenDTO";
import { CreateParticipantAccessTokenPort } from "@core/domain/participant/usecase/port/CreateParticipantAccessTokenPort";
import { LivekitParticipantMetadata } from "./types/LivekitParticipantMetadata";
import { Participant } from "@core/domain/participant/entity/Participant";
import { LivekitParticipantMapper } from "./mappers/LivekitParticipantMapper";
import { createSendDataMessageAction } from "./Actions";
import {
  DataPacket_Kind,
  SendDataOptions,
  VideoGrant,
} from "livekit-server-sdk";
import { RoomType } from "@core/common/enums/RoomEnum";

export type IWebRTCLivekitService = {
  createRoom: (port: CreateRoomPort) => Promise<CoreRoom>;
  getRoomById: (id: string) => Promise<CoreRoom>;
  deleteRoomById: (id: string) => Promise<void>;
  // createRoomAccessToken: (roomId: string, partName: string) => Promise<string>;
  createParticipantAccessToken: (
    port: CreateParticipantAccessTokenPort,
  ) => Promise<string>;
  verifyParticipantAccessToken: (
    token: string,
  ) => Promise<ParticipantAccessTokenDTO>;
  addRoom(room: CoreRoom): Promise<CoreRoom>;
};

@Injectable()
export class WebRTCLivekitService
  extends WebRTCLivekitServiceBase
  implements IWebRTCLivekitService
{
  private readonly emptyTimeout: number = 100;
  private readonly maxParticipants: number = 100;

  constructor(configService: ConfigService<EnvironmentVariablesConfig, true>) {
    const host = configService.get("WEBRTC_LIVEKIT_API_HOST");
    const clientId = configService.get("WEBRTC_LIVEKIT_CLIENT_ID");
    const clientSecret = configService.get("WEBRTC_LIVEKIT_CLIENT_SECRET");
    super(host, clientId, clientSecret);
  }

  async createRoomAccessToken(
    roomId: string,
    partName: string,
  ): Promise<string> {
    const room = await this.getRoomById(roomId);
    const permissions = this.getPermissionsByRoomType(room.type);
    const token = await this.createAccessToken<LivekitRoomMetadata>({
      identity: room.id,
      username: partName,
      permissions,
      metadata: {
        roomName: room.name,
        roomType: room.type,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        removedAt: room.removedAt,
      },
    });
    return token;
  }

  async createRoom(port: CreateRoomPort): Promise<CoreRoom> {
    const metadata: LivekitRoomMetadata = {
      roomName: port.roomName,
      roomType: port.roomType,
      createdAt: port.createdAt,
      updatedAt: port.updatedAt,
      removedAt: port.removedAt,
    };

    const room = await this.roomServiceClient.createRoom({
      name: port.roomId,
      emptyTimeout: port.roomTimeout ?? this.emptyTimeout,
      maxParticipants: port.roomMaxParticipants ?? this.maxParticipants,
      metadata: JSON.stringify(metadata),
    });
    return LivekitRoomMapper.toDomainEntity(room);
  }

  async getRoomById(id: string): Promise<CoreRoom> {
    const rooms = await this.roomServiceClient.listRooms([id]);
    if (rooms.length < 1) throw new NotFoundException("Room not found!");
    return LivekitRoomMapper.toDomainEntity(rooms[0]);
  }

  async getRoomByName(name: string): Promise<CoreRoom[]> {
    const rooms = await this.roomServiceClient.listRooms();
    const filtered: CoreRoom[] = [];
    for (const room of rooms) {
      const _room = await LivekitRoomMapper.toDomainEntity(room);
      if (_room.name === name) filtered.push(_room);
    }
    return filtered;
  }

  async deleteRoomById(id: string): Promise<void> {
    const room = await this.roomServiceClient.listRooms([id]);
    if (room.length < 1) throw new NotFoundException("Room not found!");
    return this.roomServiceClient.deleteRoom(id);
  }

  async createParticipantAccessToken(
    port: CreateParticipantAccessTokenPort,
  ): Promise<string> {
    const { roomId, participant } = port;

    return this.createAccessToken<LivekitParticipantMetadata>({
      identity: participant.id,
      username: participant.name,
      permissions: {
        room: roomId,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        roomList: false,
        roomCreate: false,
        canPublishData: true,
        canPublishSources: [],
      },
      metadata: participant,
    });
  }

  async verifyParticipantAccessToken(
    token: string,
  ): Promise<ParticipantAccessTokenDTO> {
    const result = await this.verifyToken<LivekitParticipantMetadata>(token);
    const roomId = result.permissions.room;
    if (!roomId) throw new ForbiddenException();
    const room = await this.getRoomById(roomId);

    return {
      roomId: room.id,
      roomType: room.type,
      roomName: room.name,
      participant: result.metadata,
    };
  }

  async getParticipantInRoomById(
    roomId: string,
    partId: string,
  ): Promise<Participant> {
    const part = await this.roomServiceClient
      .getParticipant(roomId, partId)
      .catch(() => null);
    if (!part) throw new NotFoundException("Participant not found!");
    return LivekitParticipantMapper.toDomainEntity(part);
  }

  async deleteParticipantInRoomById(roomId: string, partId: string) {
    return await this.roomServiceClient.removeParticipant(roomId, partId);
  }

  async sendDataMessage(payload: {
    sendTo: { roomId: string; partIds?: string[] };
    action: ReturnType<typeof createSendDataMessageAction>;
  }) {
    const { sendTo, action } = payload;
    const encoder = new TextEncoder();
    const actionStr = encoder.encode(JSON.stringify(action));

    const sendDataOptions: SendDataOptions = {
      destinationIdentities: sendTo.partIds,
    };

    return await this.roomServiceClient
      .sendData(
        sendTo.roomId,
        actionStr,
        DataPacket_Kind.RELIABLE,
        sendDataOptions,
      )
      .catch((e) => console.log(e));
  }

  async addRoom(room: CoreRoom): Promise<CoreRoom> {
    await this.createRoom({
      roomId: room.id,
      roomName: room.name,
      roomType: room.type,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      removedAt: room.removedAt,
    });
    return room;
  }

  //Private Methods
  private getPermissionsByRoomType(roomType: RoomType): VideoGrant {
    switch (roomType) {
      case RoomType.MEETING:
        return {
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
          roomList: false,
          roomCreate: false,
          // canPublishData: true,
        };
      case RoomType.WAITING:
        return {
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
          roomList: false,
          roomCreate: false,
          canPublishData: true,
          // canPublishSources: [],
        };
      default:
        return {
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
          roomList: false,
          roomCreate: false,
          // canPublishData: true,
          // canPublishSources: [],
        };
    }
  }
}
