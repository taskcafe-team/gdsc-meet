import { MeetingType } from "@core/common/enums/MeetingEnums";

export type CreateMeetingPort = {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  type?: MeetingType;
};
