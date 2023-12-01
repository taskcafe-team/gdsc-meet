import { MeetingType } from "@core/common/enums/MeetingEnums";

export class UpdateMeetingDTO {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  type?: MeetingType;
}
