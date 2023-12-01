import { RoomUsecase } from "@core/domain/room/usecase/RoomUsecase";
import { Injectable } from "@nestjs/common";
import { CreateRoomDTO } from "@core/domain/room/usecase/dtos/CreateRoomDTO";
import { WebRTCLivekitService } from "@infrastructure/adapter/webrtc/WebRTCLivekitService";
import { Room } from "@core/domain/room/entity/Room";
import { RoomUsecaseDTO } from "@core/domain/room/usecase/dtos/RoomUsecaseDTO";
import { HttpParticipantPayload } from "@application/api/http-rest/auth/type/HttpParticipantTypes";

type RoomAccessTokenDTO = {
  roomId: string;
  roomType: string;
  token: string;
};

@Injectable()
export class RoomService implements RoomUsecase {
  constructor(private readonly webRTCService: WebRTCLivekitService) {}

  async createRoom(dto: CreateRoomDTO): Promise<RoomUsecaseDTO> {
    const { type, name } = dto;
    const room = await Room.new({ type, name });
    await this.webRTCService.addRoom(room);
    return RoomUsecaseDTO.newFromEntity(room);
  }

  async getRoomById(id: string): Promise<RoomUsecaseDTO> {
    const room = await this.webRTCService.getRoomById(id);
    return RoomUsecaseDTO.newFromEntity(room);
  }

  async getRoomByName(name: string): Promise<RoomUsecaseDTO[]> {
    const rooms = await this.webRTCService.getRoomByName(name);
    return rooms.map((room) => RoomUsecaseDTO.newFromEntity(room));
  }

  async deleteRoomById(id: string): Promise<{ id: string }> {
    await this.webRTCService.deleteRoomById(id);
    return { id };
  }

  async deleteRoomByName(name: string): Promise<void> {
    const rooms = await this.webRTCService.getRoomByName(name);
    if (rooms.length === 0) throw new Error("Room not found");
    for (const room of rooms) await this.webRTCService.deleteRoomById(room.id);
  }

  async createRoomAccessToken(
    roomId: string,
    part: HttpParticipantPayload,
  ): Promise<RoomAccessTokenDTO> {
    const room = await this.getRoomById(roomId);
    const { id, name, meetingId, role } = part;
    const userId = part.userId ?? null;
    const token = await this.webRTCService.createParticipantAccessToken({
      roomId: room.id,
      roomName: room.name,
      roomType: room.type,
      participant: { id, name, meetingId, userId, role, avatar: "" }, //TODO: fix avatar
    });
    return { roomId: roomId, roomType: room.type, token };
  }
}
