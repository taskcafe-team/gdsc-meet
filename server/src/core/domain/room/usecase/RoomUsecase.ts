import { CreateRoomDTO } from "./dtos/CreateRoomDTO";
// import { MoveParticipantToRoomDTO } from "./dtos/MoveParticipantToRoomDTO";
import { RoomUsecaseDTO } from "./dtos/RoomUsecaseDTO";

export interface RoomUsecase {
  createRoom(dto: CreateRoomDTO): Promise<RoomUsecaseDTO>;
  deleteRoomById(id: string): Promise<{ id: string }>;
  getRoomById(id: string): Promise<RoomUsecaseDTO>;
  getRoomByName(name: string): Promise<RoomUsecaseDTO[]>;
  deleteRoomByName(name: string): Promise<void>;
  // getRoomAccessToken(id: string): Promise<string>;
  // moveParticipantToRoom(dto: MoveParticipantToRoomDTO): Promise<void>;
}
