import { MeetingUsecaseDto } from "./dto/MeetingUsecaseDto";
import { Meeting } from "../entity/Meeting";
import { CreateMeetingPort } from "./port/CreateMeetingPort";

export interface MeetingUsecase {
  createMeeting(payload: CreateMeetingPort): Promise<MeetingUsecaseDto>;
  getMyMeetings(): Promise<Meeting[]>;
  deleteMeetings(payload: { ids: string[] }): Promise<string[]>;
  getMeeting(payload: { meetingId: string }): Promise<MeetingUsecaseDto>;
}
