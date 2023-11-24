import { MeetingUsecaseDto } from "./dto/MeetingUsecaseDto";
import { CreateMeetingPort } from "./port/CreateMeetingPort";
import { UpdateMeetingPort } from "./port/UpdateMeetingPort";

export interface MeetingUsecase {
  createMeeting(
    createrId: string,
    payload: CreateMeetingPort,
  ): Promise<MeetingUsecaseDto>;
  getMeetingById(id: string): Promise<MeetingUsecaseDto>;
  getMeeting(getterId: string, meetingId: string): Promise<MeetingUsecaseDto>;
  updateMeeting(updateId: string, payload: UpdateMeetingPort): Promise<void>;
  deleteMeetings(ids: string[]): Promise<string[]>;
  getMyMeetings(getter: string): Promise<MeetingUsecaseDto[]>;
  getAllMeetings(): Promise<MeetingUsecaseDto[]>;
  deleteMeetingById(id: string): Promise<string>;
  getMeetingsByUserId(payload: {
    userId: string;
  }): Promise<MeetingUsecaseDto[]>;
}
