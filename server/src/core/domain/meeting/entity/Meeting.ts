import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";

import { Entity } from "@core/common/entity/Entity";
import { Nullable } from "@core/common/type/CommonTypes";
import { CreateMeetingEntityPayload } from "./type/CreateMeetingEntityPayload";
import { EditMeetingEntityPayload } from "./type/EditMeetingEntityPayload";
import { MeetingType } from "@core/common/enums/MeetingEnums";

export class Meeting extends Entity {
  @IsDate() private _startTime: Date;
  @IsOptional() @IsDate() private _endTime: Nullable<Date>;
  @IsOptional() @IsString() private _title: Nullable<string>;
  @IsOptional() @IsString() private _description: Nullable<string>;
  @IsEnum(MeetingType) private _type: MeetingType;

  constructor(payload: CreateMeetingEntityPayload) {
    super(payload.id, payload.createdAt, payload.updatedAt, payload.removedAt);

    this._startTime = payload.startTime ?? new Date();
    this._endTime = payload.endTime ?? null;
    this._title = payload.title ?? null;
    this._description = payload.description ?? null;
    this._type = payload.type ?? MeetingType.PRIVATE;
  }

  //Getter
  public get startTime(): Date {
    return this._startTime;
  }
  public get endTime(): Nullable<Date> {
    return this._endTime;
  }
  public get title(): Nullable<string> {
    return this._title;
  }
  public get description(): Nullable<string> {
    return this._description;
  }
  public get type(): MeetingType {
    return this._type;
  }

  // Method
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
    if (payload.startTime !== undefined) this._startTime = payload.startTime;
    if (payload.endTime !== undefined) this._endTime = payload.endTime;
    if (payload.title !== undefined) this._title = payload.title;
    if (payload.description !== undefined)
      this._description = payload.description;
    if (payload.type !== undefined) this._type = payload.type;

    if (
      payload.startTime !== undefined ||
      payload.endTime !== undefined ||
      payload.title !== undefined ||
      payload.description !== undefined ||
      payload.type !== undefined
    )
      this._updatedAt = new Date();

    await this.validate();
  }
}
