import { ClassValidator } from "@core/common/util/class-validator/ClassValidator";
import { Nullable } from "../type/CommonTypes";
import { AppException } from "../exception/AppException";
import { AppErrors } from "../exception/AppErrors";
import { IsDate, IsOptional, IsUUID } from "class-validator";
import { v4 } from "uuid";
import { Expose } from "class-transformer";

export class Entity {
  @IsUUID() protected readonly _id: string;
  @IsDate() protected readonly _createdAt: Date;
  @IsOptional() @IsDate() protected _updatedAt: Nullable<Date>;
  @IsOptional() @IsDate() protected _removedAt: Nullable<Date>;

  protected constructor(
    id?: string,
    createdAt?: Date,
    removedAt?: Nullable<Date>,
    updatedAt?: Nullable<Date>,
  ) {
    this._id = id ?? v4();
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? null;
    this._removedAt = removedAt ?? null;
  }

  public get id() {
    return this._id;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Nullable<Date> {
    return this._updatedAt;
  }
  public get removedAt(): Nullable<Date> {
    return this._removedAt;
  }

  public async validate(): Promise<void> {
    const details = await ClassValidator.validate(this);
    if (details) throw new AppException(AppErrors.VALIDATION_FAILURE, details);
  }
}
