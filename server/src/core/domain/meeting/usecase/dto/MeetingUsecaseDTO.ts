import { Exclude, Expose, plainToClass } from "class-transformer";
import { Meeting } from "../../entity/Meeting";
import { Nullable } from "@core/common/type/CommonTypes";
import { MeetingType } from "@core/common/enums/MeetingEnums";

@Exclude()
export class MeetingUsecaseDTO {
  @Expose() public id: string;
  @Expose() public startTime: Date;
  @Expose() public endTime: Nullable<Date>;
  @Expose() public title: Nullable<string>;
  @Expose() public description: Nullable<string>;
  @Expose() public type: MeetingType;

  public static newFromEntity(entity: Meeting): MeetingUsecaseDTO {
    return plainToClass(MeetingUsecaseDTO, entity);
  }

  public static newListFromEntitys(
    listEntitys: Meeting[],
  ): MeetingUsecaseDTO[] {
    return listEntitys.map((entity) => this.newFromEntity(entity));
  }
}
