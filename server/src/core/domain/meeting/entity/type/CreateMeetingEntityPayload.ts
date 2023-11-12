import { MeetingType } from "@core/common/enums/MeetingEnums";

export type CreateMeetingEntityPayload = {
  startTime?: Date;
  endTime?: Date;
  title?: string;
  description?: string;
  type?: MeetingType;

  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  removedAt?: Date;
};
