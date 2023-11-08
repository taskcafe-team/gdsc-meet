import { IBaseRepository } from "@core/common/persistence/IBaseRepository";
import { Optional } from "@core/common/type/CommonTypes";
import { Meeting } from "../entity/Meeting";
import { MeetingStatusEnums } from "@core/common/enums/MeetingEnums";

export interface MeetingRepositoryPort extends IBaseRepository<Meeting> {
  findMeeting(by: { id: string }): Promise<Optional<Meeting>>;
  addMeeting(meeting: Meeting): Promise<Meeting>;
  updateMeeting(
    by: { id: string },
    data: {
      startTime?: Date;
      endTime?: Date;
      title?: string;
      description?: string;
    },
  ): Promise<Optional<{ id: string }>>;
  deleteMeeting(by: { id: string }): Promise<Optional<{ id: string }>>;
  deleteMeetings(by: { ids: string[] }): Promise<string[]>;
  findMeetings(by: {
    id?: string;
    ids?: string[];
    status?: MeetingStatusEnums;
  }): Promise<Meeting[]>;
}
