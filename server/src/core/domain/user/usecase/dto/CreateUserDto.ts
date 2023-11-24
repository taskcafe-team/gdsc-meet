import { UserRole } from "@core/common/enums/UserEnums";

export class CreateUserDto {
  public firstName: string;
  public lastName: string;
  public email: string;
  public password: string;
  public role: UserRole;
  public avatar: string;
}
