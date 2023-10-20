import { Nullable } from "@core/common/type/CommonTypes";
import { Meeting, MeetingStatusEnums } from "@prisma/client";

export class PrismaMeeting implements Meeting {
  public id: string;
  public startTime: Date;
  public endTime: Nullable<Date>;
  public title: Nullable<string>;
  public description: Nullable<string>;
  public status: MeetingStatusEnums;

  public createdAt: Date;
  public updatedAt: Nullable<Date>;
  public removedAt: Nullable<Date>;
}
