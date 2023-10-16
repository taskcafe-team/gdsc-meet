import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsDate,
  IsBoolean,
} from "class-validator";
import { v4 } from "uuid";
import { UserRole } from "@core/common/enums/UserEnums";
import { Nullable } from "@core/common/type/CommonTypes";
import { CreateUserEntityPayload } from "@core/domain/user/entity/type/CreateUserEntityPayload";
import { EditUserEntityPayload } from "@core/domain/user/entity/type/EditUserEntityPayload";
import { Entity } from "@core/common/entity/Entity";
import { compare, genSalt, hash } from "bcryptjs";
import { ProviderNameEnums } from "@core/common/enums/ProviderNameEnums";

export class User extends Entity<string> {
  @IsOptional()
  @IsString()
  public firstName: Nullable<string>;

  @IsOptional()
  @IsString()
  public lastName: Nullable<string>;

  @IsOptional()
  @IsEmail()
  public email: Nullable<string>;

  @IsBoolean() public isValid: boolean;

  @IsOptional()
  @IsString()
  public password: Nullable<string>;

  @IsEnum(UserRole) public role: UserRole;

  @IsOptional()
  @IsString()
  public avatar: Nullable<string>;

  @IsOptional()
  @IsEnum(ProviderNameEnums)
  public providerName: Nullable<ProviderNameEnums>;

  @IsOptional()
  @IsString()
  public providerId: Nullable<string>;

  @IsDate()
  public readonly createdAt: Date;

  @IsOptional()
  @IsDate()
  public updatedAt: Nullable<Date>;

  @IsOptional()
  @IsDate()
  public removedAt: Nullable<Date>;

  constructor(payload: CreateUserEntityPayload) {
    super();

    this.firstName = payload.firstName || null;
    this.lastName = payload.lastName || null;
    this.email = payload.email || null;
    this.isValid = payload.isValid || false;
    this.role = payload.role;
    this.password = payload.password || null;
    this.avatar = payload.avatar || null;
    this.providerName = payload.providerName || null;
    this.providerId = payload.providerId || null;

    this.id = payload.id || v4();
    this.createdAt = payload.createdAt || new Date();
    this.updatedAt = payload.updatedAt || null;
    this.removedAt = payload.removedAt || null;
  }

  public fullName(): string {
    return this.firstName + " " + this.lastName;
  }

  public async hashPassword(): Promise<void> {
    if (this.password === null) return;
    const salt: string = await genSalt();
    this.password = await hash(this.password, salt);

    await this.validate();
  }

  public async comparePassword(password: string): Promise<boolean> {
    if (this.password === null) return false;
    return compare(password, this.password);
  }

  public async edit(payload: EditUserEntityPayload): Promise<void> {
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

  public async changePassword(newPassword: string): Promise<void> {
    if (this.password === null) return;

    const salt: string = await genSalt();
    this.password = await hash(newPassword, salt);
    this.isValid = true;

    await this.validate();
  }

  public async remove(): Promise<void> {
    this.removedAt = new Date();
    await this.validate();
  }

  public static async new(payload: CreateUserEntityPayload): Promise<User> {
    const user: User = new User(payload);
    await user.hashPassword();
    await user.validate();

    return user;
  }
}
