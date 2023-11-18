import { UserRole } from "@core/common/enums/UserEnums";
import { User } from "@core/domain/user/entity/User";
import { Exclude, Expose, plainToClass } from "class-transformer";

@Exclude()
export class UserUsecaseDto {
  @Expose() public id: string;
  @Expose() public firstName: string;
  @Expose() public lastName: string;
  @Expose() public email: string;
  @Expose() public role: UserRole;
  @Expose() public isValid: boolean;
  @Expose() public avatar: string;

  public static newFromEntity(entity: User): UserUsecaseDto {
    return plainToClass(UserUsecaseDto, entity);
  }

  public static newListFromEntitys(listEntitys: User[]): UserUsecaseDto[] {
    return listEntitys.map((entity) => this.newFromEntity(entity));
  }
}
