import { Nullable } from "@core/common/type/CommonTypes";

export type CreateMeetingEntityPayload = {
  startTime?: Date;
  endTime?: Nullable<Date>;
  title?: Nullable<string>;
  description?: Nullable<string>;

  id?: Nullable<string>;
  createdAt?: Nullable<Date>;
  updatedAt?: Nullable<Date>;
  removedAt?: Nullable<Date>;
};
