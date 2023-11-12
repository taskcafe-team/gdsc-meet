import { Nullable } from "@core/common/type/CommonTypes";
import { Meeting, MeetingType } from "@prisma/client";

export class PrismaMeeting implements Meeting {
  public id: string;
  public startTime: Date;
  public endTime: Nullable<Date>;
  public title: Nullable<string>;
  public description: Nullable<string>;
  public type: MeetingType;

  public createdAt: Date;
  public updatedAt: Nullable<Date>;
  public removedAt: Nullable<Date>;
}
