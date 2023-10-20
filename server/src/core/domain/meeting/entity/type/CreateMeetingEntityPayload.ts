import { MeetingStatusEnums } from "@core/common/enums/MeetingEnums";
import { Nullable } from "@core/common/type/CommonTypes";

export type CreateMeetingEntityPayload = {
  startTime?: Date;
  endTime?: Nullable<Date>;
  title?: Nullable<string>;
  description?: Nullable<string>;
  status?: Nullable<MeetingStatusEnums>;

  id?: Nullable<string>;
  createdAt?: Nullable<Date>;
  updatedAt?: Nullable<Date>;
  removedAt?: Nullable<Date>;
};
