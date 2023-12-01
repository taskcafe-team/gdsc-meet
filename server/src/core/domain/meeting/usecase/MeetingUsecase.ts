import { RoomUsecaseDTO } from "@core/domain/room/usecase/dtos/RoomUsecaseDTO";
import { MeetingUsecaseDTO } from "./dto/MeetingUsecaseDTO";
import { UpdateMeetingDTO } from "./dto/UpdateMeetingDTO";
import { CreateMeetingPort } from "./port/CreateMeetingPort";
import { RoomType } from "@core/common/enums/RoomEnum";

export interface MeetingUsecase {
  createMeeting(
    createrId: string,
    payload: CreateMeetingPort,
  ): Promise<MeetingUsecaseDTO>;
  getMeetingById(id: string): Promise<MeetingUsecaseDTO>;
  createMeetingRoom(
    meetingId: string,
    roomType: RoomType,
  ): Promise<RoomUsecaseDTO>;
  createMeetingRooms(meetingId: string): Promise<{
    waitingRoom: RoomUsecaseDTO;
    meetingRoom: RoomUsecaseDTO;
  }>;
  getMeetingRoom(
    meetingId: string,
    roomType: RoomType,
  ): Promise<RoomUsecaseDTO>;
  getMeetingRooms(meetingId: string): Promise<{
    waitingRoom: RoomUsecaseDTO;
    meetingRoom: RoomUsecaseDTO;
  }>;
  getOrCreateMeetingRooms(roomId: string): Promise<{
    waitingRoom: RoomUsecaseDTO;
    meetingRoom: RoomUsecaseDTO;
  }>;
  updateMeeting(meetingId: string, dto: UpdateMeetingDTO): Promise<void>;
  deleteMeetings(ids: string[]): Promise<{ ids: string[] }>;
  getMyMeetings(getter: string): Promise<MeetingUsecaseDTO[]>;
  getAllMeetings(): Promise<MeetingUsecaseDTO[]>;
  deleteMeetingById(id: string): Promise<{ id: string }>;
  getMeetingsByUserId(userId: string): Promise<MeetingUsecaseDTO[]>;
}
