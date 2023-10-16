import { Exclude, Expose, plainToClass } from "class-transformer";
import { Meeting } from "../entity/Meeting";
import { Nullable } from "@core/common/type/CommonTypes";

@Exclude()
export class MeetingUsecaseDto {
  @Expose() public friendlyId: string;
  @Expose() public startTime: Date;
  @Expose() public endTime: Nullable<Date>;
  @Expose() public title: Nullable<string>;
  @Expose() public description: Nullable<string>;

  public static newFromEntity(entity: Meeting): MeetingUsecaseDto {
    return plainToClass(MeetingUsecaseDto, entity);
  }

  public static newListFromEntitys(
    listEntitys: Meeting[],
  ): MeetingUsecaseDto[] {
    return listEntitys.map((entity) => this.newFromEntity(entity));
  }
}
