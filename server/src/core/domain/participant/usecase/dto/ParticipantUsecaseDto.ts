import {
  Exclude,
  Expose,
  Transform,
  Type,
  plainToClass,
} from "class-transformer";

import { Participant } from "../../entity/Participant";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";

@Exclude()
export class ParticipantUsecaseDto {
  @Expose() public id: string;
  @Expose() public name: string;
  @Expose() public userId: string;
  @Expose()
  @Type(() => UserUsecaseDto)
  public userInfo: UserUsecaseDto;

  public static newFromEntity(entity: Participant): ParticipantUsecaseDto {
    return plainToClass(ParticipantUsecaseDto, entity);
  }

  public static newListFromEntitys(
    listEntitys: Participant[],
  ): ParticipantUsecaseDto[] {
    return listEntitys.map((entity) => this.newFromEntity(entity));
  }
}
