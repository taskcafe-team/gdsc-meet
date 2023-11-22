import { UseCaseValidatableAdapter } from "@core/common/adapter/usecase/UseCaseValidatableAdapter";
import { AuthProviderName } from "@core/common/enums/AuthEnum";
import { UserRole } from "@core/common/enums/UserEnums";
import { CreateUserPort } from "@core/domain/user/usecase/port/CreateUserPort";
import { Exclude, Expose, plainToClass } from "class-transformer";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

@Exclude()
export class CreateUserAdapter
  extends UseCaseValidatableAdapter
  implements CreateUserPort
{
  @Expose() @IsOptional() @IsString() firstName: string | null;

  @Expose() @IsOptional() @IsString() lastName: string | null;

  @Expose() @IsEmail() email: string;

  @Expose() @IsEnum(UserRole) role: UserRole;

  @Expose() @IsOptional() @IsString() password: string | null;

  @Expose() @IsOptional() @IsString() avatar: string | null;

  @Expose() @IsOptional() @IsString() authProviderName: AuthProviderName | null;

  @Expose() @IsOptional() @IsString() providerId: string | null;

  public static async new(payload: CreateUserPort): Promise<CreateUserAdapter> {
    const adapter: CreateUserAdapter = plainToClass(CreateUserAdapter, payload);
    await adapter.validate();

    return adapter;
  }
}
