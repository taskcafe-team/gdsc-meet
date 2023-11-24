import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { UserRole } from "@core/common/enums/UserEnums";
import { Nullable } from "@core/common/type/CommonTypes";
import { CreateUserEntityPayload } from "@core/domain/user/entity/type/CreateUserEntityPayload";
import { EditUserEntityPayload } from "@core/domain/user/entity/type/EditUserEntityPayload";
import { Entity } from "@core/common/entity/Entity";
import { compare, genSalt, hash } from "bcryptjs";
import { AuthProviderName } from "@prisma/client";

export class User extends Entity {
  @IsOptional() @IsString() private _firstName: Nullable<string>;
  @IsOptional() @IsString() private _lastName: Nullable<string>;
  @IsOptional() @IsEmail() private _email: Nullable<string>;
  @IsOptional() @IsString() private _password: Nullable<string>;
  @IsBoolean() private _isValid: boolean;
  @IsEnum(UserRole) private _role: UserRole;
  @IsOptional() @IsString() private _avatar: Nullable<string>;

  @IsOptional()
  @IsEnum(AuthProviderName)
  private _authProviderName: Nullable<AuthProviderName>;
  @IsOptional() @IsString() private _providerId: Nullable<string>;

  constructor(payload: CreateUserEntityPayload) {
    super(payload.id, payload.createdAt, payload.updatedAt, payload.removedAt);

    this._firstName = payload.firstName ?? null;
    this._lastName = payload.lastName ?? null;
    this._email = payload.email ?? null;
    this._password = payload.password ?? null;
    this._isValid = payload.isValid ?? false;
    this._role = payload.role ?? UserRole.USER;
    this._avatar = payload.avatar ?? null;

    this._authProviderName = payload.authProviderName ?? null;
    this._providerId = payload.providerId ?? null;
  }

  // Getter
  public get firstName(): Nullable<string> {
    return this._firstName;
  }
  public get lastName(): Nullable<string> {
    return this._lastName;
  }
  public get email(): Nullable<string> {
    return this._email;
  }
  public get password(): Nullable<string> {
    return this._password;
  }
  public get isValid(): boolean {
    return this._isValid;
  }
  public get role(): UserRole {
    return this._role;
  }
  public get avatar(): Nullable<string> {
    return this._avatar;
  }
  public get authProviderName(): Nullable<AuthProviderName> {
    return this._authProviderName;
  }
  public get providerId(): Nullable<string> {
    return this._providerId;
  }

  // Method
  public fullName(): string {
    const fn = this._firstName ?? "";
    const ln = this._lastName ?? "";
    return (fn + " " + ln).trim();
  }

  public async hashPassword(): Promise<void> {
    if (!this._password) return;
    const salt: string = await genSalt();
    this._password = await hash(this._password, salt);
    await this.validate();
  }

  public async comparePassword(password: string): Promise<boolean> {
    if (!Boolean(this._password)) return false;
    return compare(password, this._password);
  }

  public async edit(payload: EditUserEntityPayload): Promise<void> {
    let isUpdated = false;
    if (payload.firstName !== undefined) this._firstName = payload.firstName;
    if (payload.lastName !== undefined) this._lastName = payload.lastName;
    if (payload.avatar !== undefined) this._avatar = payload.avatar;
    if (payload.isValid !== undefined) this._isValid = payload.isValid;

    if (
      payload.firstName !== undefined ||
      payload.lastName !== undefined ||
      payload.avatar !== undefined ||
      payload.isValid !== undefined
    )
      isUpdated = true;

    if (isUpdated) this._updatedAt = new Date();
    await this.validate();
  }

  public async changePassword(newPassword: string): Promise<void> {
    if (!Boolean(this._password)) return;
    const salt: string = await genSalt();
    this._password = await hash(newPassword, salt);
    await this.validate();
  }

  public static async new(payload: CreateUserEntityPayload): Promise<User> {
    const user: User = new User(payload);

    await user.hashPassword();
    await user.validate();
    return user;
  }
}
