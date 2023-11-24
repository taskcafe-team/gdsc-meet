import { Exclude, Expose, plainToClass } from "class-transformer";
import { Meeting } from "../../entity/Meeting";
import { Nullable } from "@core/common/type/CommonTypes";
import { MeetingType } from "@core/common/enums/MeetingEnums";
import { UserRole } from "@core/common/enums/UserEnums";

@Exclude()
export class MeetingUsecaseDto {
  @Expose() public id: string;
  @Expose() public startTime: Date;
  @Expose() public endTime: Nullable<Date>;
  @Expose() public title: Nullable<string>;
  @Expose() public description: Nullable<string>;
  @Expose() public type: MeetingType;

  public static newFromEntity(entity: Meeting): MeetingUsecaseDto {
    return plainToClass(MeetingUsecaseDto, entity);
  }

  public static newListFromEntitys(
    listEntitys: Meeting[],
  ): MeetingUsecaseDto[] {
    return listEntitys.map((entity) => this.newFromEntity(entity));
  }
}

export class CreateUserDto {
  public firstName: string;
  public lastName: string;
  public email: string;
  public password: string;
  public role: UserRole;
  public avatar: string;
}

export class UpdateUserDto {
  public firstName: string;
  public lastName: string;
  public role: UserRole;
  public avatar: string;
}
