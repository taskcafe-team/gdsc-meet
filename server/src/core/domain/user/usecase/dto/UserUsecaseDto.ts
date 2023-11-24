import { UserRole } from "@core/common/enums/UserEnums";
import { Nullable } from "@core/common/type/CommonTypes";
import { User } from "@core/domain/user/entity/User";
import { Exclude, Expose, plainToClass } from "class-transformer";

@Exclude()
export class UserUsecaseDto implements Partial<User> {
  @Expose() public id: string;
  @Expose() public firstName: Nullable<string>;
  @Expose() public lastName: Nullable<string>;
  @Expose() public email: Nullable<string>;
  @Expose() public role: UserRole;
  @Expose() public isValid: boolean;
  @Expose() public avatar: Nullable<string>;

  public static newFromEntity(entity: User): UserUsecaseDto {
    return plainToClass(UserUsecaseDto, entity);
  }

  public static newListFromEntitys(listEntitys: User[]): UserUsecaseDto[] {
    return listEntitys.map((entity) => this.newFromEntity(entity));
  }
}
