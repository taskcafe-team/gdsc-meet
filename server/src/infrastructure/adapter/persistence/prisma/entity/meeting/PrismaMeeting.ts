import { Nullable } from "@core/common/type/CommonTypes";
import { Meeting, MeetingType } from "@prisma/client";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PrismaMeeting implements Meeting {
  @Expose() public id: string;
  @Expose() public startTime: Date;
  @Expose() public endTime: Nullable<Date>;
  @Expose() public title: Nullable<string>;
  @Expose() public description: Nullable<string>;
  @Expose() public type: MeetingType;

  @Expose() public createdAt: Date;
  @Expose() public updatedAt: Nullable<Date>;
  @Expose() public removedAt: Nullable<Date>;
}
