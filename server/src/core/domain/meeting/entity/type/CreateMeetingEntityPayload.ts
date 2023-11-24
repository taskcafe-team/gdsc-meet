import { MeetingType } from "@core/common/enums/MeetingEnums";
import { Nullable } from "@core/common/type/CommonTypes";

export type CreateMeetingEntityPayload = {
  startTime?: Date;
  endTime?: Nullable<Date>;
  title?: Nullable<string>;
  description?: Nullable<string>;
  type?: MeetingType;

  id?: string;
  createdAt?: Date;
  updatedAt?: Nullable<Date>;
  removedAt?: Nullable<Date>;
};
