import { Room } from "@core/domain/room/entity/Room";
import { Room as RoomLivekit } from "livekit-server-sdk";
import { LivekitRoomMetadata } from "../types/LivekitRoomMetadata";

export class LivekitRoomMapper {
  static toDomainEntity(livekitEntity: RoomLivekit): Promise<Room> {
    const metadata = JSON.parse(livekitEntity.metadata) as LivekitRoomMetadata;
    return Room.new({
      id: livekitEntity.name,
      name: metadata.roomName,
      type: metadata.roomType,
      createdAt: new Date(metadata.createdAt),
      updatedAt: metadata.updatedAt && new Date(metadata.updatedAt),
      removedAt: metadata.removedAt && new Date(metadata.removedAt),
    });
  }

  static toDomainEntities(livekitEntities: RoomLivekit[]): Promise<Room[]> {
    return Promise.all(livekitEntities.map(this.toDomainEntity));
  }
}
