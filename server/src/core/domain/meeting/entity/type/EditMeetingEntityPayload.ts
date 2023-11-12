import { Nullable } from "@core/common/type/CommonTypes";

export type EditMeetingEntityPayload = {
  startTime?: Date;
  endTime?: Nullable<Date>;
  title?: Nullable<string>;
  description?: Nullable<string>;
};
