import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { v4 } from "uuid";

import { Entity } from "@core/common/entity/Entity";
import { Nullable } from "@core/common/type/CommonTypes";
import { CreateMeetingEntityPayload } from "./type/CreateMeetingEntityPayload";
import { EditMeetingEntityPayload } from "./type/EditMeetingEntityPayload";
import { MeetingType } from "@core/common/enums/MeetingEnums";

export class Meeting extends Entity<string> {
  @IsDate() public startTime: Date;
  @IsOptional() @IsDate() public endTime: Nullable<Date>;
  @IsOptional() @IsString() public title: Nullable<string>;
  @IsOptional() @IsString() public description: Nullable<string>;
  @IsEnum(MeetingType) public type: MeetingType;

  @IsDate() public readonly createdAt: Date;
  @IsOptional() @IsDate() public updatedAt: Nullable<Date>;
  @IsOptional() @IsDate() public removedAt: Nullable<Date>;

  constructor(payload: CreateMeetingEntityPayload) {
    super();

    this.startTime = payload.startTime || new Date();
    this.endTime = payload.endTime || null;
    this.title = payload.title || null;
    this.description = payload.description || null;
    this.type = payload.type || MeetingType.PRIVATE;

    this.id = payload.id || v4();
    this.createdAt = payload.createdAt || new Date();
    this.updatedAt = payload.updatedAt || null;
    this.removedAt = payload.removedAt || null;
  }

  public static generatorFriendlyId(): string {
    const str =
      Math.random().toString(36).substring(2, 9) +
      Math.random().toString(36).substring(2, 9);
    const arr = str.substring(2, 14).split("");
    arr[3] = "-";
    arr[8] = "-";

    return arr.join("");
  }

  public static async new(
    payload: CreateMeetingEntityPayload,
  ): Promise<Meeting> {
    const meeting: Meeting = new Meeting(payload);
    await meeting.validate();

    return meeting;
  }

  public async edit(payload: EditMeetingEntityPayload): Promise<void> {
    let isUpdated = false;
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        this[key] = value;
        isUpdated = true;
      }
    });

    if (isUpdated) this.updatedAt = new Date();
    await this.validate();
  }
}
