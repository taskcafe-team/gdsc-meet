import { MeetingUsecaseDto } from "./dto/MeetingUsecaseDto";
import { CreateMeetingPort } from "./port/CreateMeetingPort";
import { UpdateMeetingPort } from "./port/UpdateMeetingPort";
import { HttpParticipantPayload } from "@application/api/http-rest/auth/type/HttpParticipantTypes";

export interface MeetingUsecase {
  createMeeting(
    createrId: string,
    payload: CreateMeetingPort,
  ): Promise<MeetingUsecaseDto>;
  getMeetingById(id: string): Promise<MeetingUsecaseDto>;
  getMeeting(getterId: string, meetingId: string): Promise<MeetingUsecaseDto>;
  updateMeeting(
    updater: HttpParticipantPayload,
    updateId: string,
    payload: UpdateMeetingPort,
  ): Promise<void>;
  deleteMeetings(ids: string[]): Promise<string[]>;
  getMyMeetings(getter: string): Promise<MeetingUsecaseDto[]>;
  getAllMeetings(): Promise<MeetingUsecaseDto[]>;
  deleteMeetingById(id: string): Promise<string>;
  getMeetingsByUserId(payload: {
    userId: string;
  }): Promise<MeetingUsecaseDto[]>;
}
