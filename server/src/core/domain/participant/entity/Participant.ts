import { v4 } from "uuid";
import {
  IsDate,
  IsEnum,
  IsInstance,
  IsOptional,
  IsString,
} from "class-validator";

import { Entity } from "@core/common/entity/Entity";
import { Nullable } from "@core/common/type/CommonTypes";
import { User } from "@core/domain/user/entity/User";

import { CreateParticipantEntityPayload } from "./type/CreateParticipantEntityPayload";
import { EditParticipantEntityPayload } from "./type/EditParticipantEntityPayload";
import { Exception } from "@core/common/exception/Exception";
import Code from "@core/common/constants/Code";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Meeting } from "@core/domain/meeting/entity/Meeting";

export class Participant extends Entity<string> {
  @IsString() public meetingId: string;
  @IsOptional() @IsString() public name: string;
  @IsOptional() @IsString() public userId: Nullable<string>;
  @IsEnum(ParticipantRole) public role: ParticipantRole;

  @IsOptional() @IsInstance(User) public user: Nullable<User>;
  @IsOptional() @IsInstance(Meeting) public meeting: Nullable<Meeting>;

  @IsDate() public createdAt: Date;
  @IsOptional() @IsDate() public updatedAt: Nullable<Date>;
  @IsOptional() @IsDate() public removedAt: Nullable<Date>;

  constructor(payload: CreateParticipantEntityPayload) {
    super();

    this.meetingId = payload.meetingId;
    this.userId = payload.userId || null;
    this.name = payload.name || "";
    this.role = ParticipantRole.PARTICIPANT;

    this.user = payload.user || null;
    this.meeting = payload.meeting || null;

    this.id = payload.id || v4();
    this.createdAt = payload.createdAt || new Date();
    this.updatedAt = payload.updatedAt || null;
    this.removedAt = payload.removedAt || null;
  }

  public async edit(payload: EditParticipantEntityPayload): Promise<void> {
    const updatedKeys: string[] = [];

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        this[key] = value;
        updatedKeys.push(key);
      }
    });

    if (updatedKeys.length > 0) {
      this.updatedAt = new Date();
      await this.validate();
    }
  }

  public static async new(
    payload: CreateParticipantEntityPayload,
  ): Promise<Participant> {
    const participant: Participant = new Participant(payload);
    await participant.validate();

    return participant;
  }

  public async validate(): Promise<void> {
    if (!this.name && !this.userId)
      throw Exception.new(
        Code.ENTITY_VALIDATION_ERROR.code.toString(),
        "At least one of name or userId must exist.",
      );

    await super.validate();
  }
}
