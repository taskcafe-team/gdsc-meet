import { RoomType } from "@core/common/enums/RoomEnum";
import { Exclude, Expose, plainToClass } from "class-transformer";
import { Room } from "../../entity/Room";

@Exclude()
export class RoomUsecaseDTO {
  @Expose() public id: string;
  @Exclude() public name: string;
  @Expose() public type: RoomType;
  @Expose() public participants: string[];

  public static newFromEntity(entity: Room): RoomUsecaseDTO {
    return plainToClass(RoomUsecaseDTO, entity);
  }

  public static newListFromEntitys(listEntitys: Room[]): RoomUsecaseDTO[] {
    return listEntitys.map((entity) => this.newFromEntity(entity));
  }
}
