import {
  IsEnum,
  IsInstance,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

import { Entity } from "@core/common/entity/Entity";
import { Nullable } from "@core/common/type/CommonTypes";
import { User } from "@core/domain/user/entity/User";

import { CreateParticipantEntityPayload } from "./type/CreateParticipantEntityPayload";
import { EditParticipantEntityPayload } from "./type/EditParticipantEntityPayload";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Meeting } from "@core/domain/meeting/entity/Meeting";

export class Participant extends Entity {
  @IsNotEmpty() @IsString() private _meetingId: string;
  @IsNotEmpty() @IsString() private _name: string;
  @IsOptional() @IsString() private _userId: Nullable<string>;
  @IsEnum(ParticipantRole) private _role: ParticipantRole;

  @IsOptional() @IsInstance(User) private _user: Nullable<User>;
  @IsOptional() @IsInstance(Meeting) private _meeting: Nullable<Meeting>;

  constructor(payload: CreateParticipantEntityPayload) {
    super(payload.id, payload.createdAt, payload.updatedAt, payload.removedAt);

    this._meetingId = payload.meetingId;
    this._name = payload.name;
    this._userId = payload.userId ?? null;
    this._role = payload.role ?? ParticipantRole.PARTICIPANT;

    this._user = payload.user ?? null;
    this._meeting = payload.meeting ?? null;
  }

  //Getter
  public get meetingId(): string {
    return this._meetingId;
  }
  public get name(): string {
    return this._name;
  }
  public get userId(): Nullable<string> {
    return this._userId;
  }
  public get role(): ParticipantRole {
    return this._role;
  }
  public get user(): Nullable<User> {
    return this._user;
  }
  public get meeting(): Nullable<Meeting> {
    return this._meeting;
  }

  // Method
  public async edit(payload: EditParticipantEntityPayload): Promise<void> {
    if (payload.name !== undefined) this._name = payload.name;
    if (payload.role !== undefined) this._role = payload.role;

    if (payload.name !== undefined || payload.role !== undefined)
      this._updatedAt = new Date();

    await this.validate();
  }

  public static async new(
    payload: CreateParticipantEntityPayload,
  ): Promise<Participant> {
    const participant: Participant = new Participant(payload);
    await participant.validate();
    return participant;
  }
}
