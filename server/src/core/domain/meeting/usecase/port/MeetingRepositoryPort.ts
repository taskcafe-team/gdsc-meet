import { Nullable } from "@core/common/type/CommonTypes";
import { Meeting } from "../../entity/Meeting";
import { MeetingType } from "@core/common/enums/MeetingEnums";
import { EditMeetingEntityPayload } from "../../entity/type/EditMeetingEntityPayload";

export interface MeetingRepositoryPort {
  findMeeting(by: { id: string }): Promise<Nullable<Meeting>>;
  addMeeting(meeting: Meeting): Promise<Meeting>;
  updateMeeting(
    by: { id: string },
    data: EditMeetingEntityPayload,
  ): Promise<Nullable<{ id: string }>>;
  deleteMeeting(by: { id: string }): Promise<Nullable<{ id: string }>>;
  deleteMeetings(by: { ids: string[] }): Promise<string[]>;
  findMeetings(by: {
    id?: string;
    ids?: string[];
    type?: MeetingType;
  }): Promise<Meeting[]>;
}
