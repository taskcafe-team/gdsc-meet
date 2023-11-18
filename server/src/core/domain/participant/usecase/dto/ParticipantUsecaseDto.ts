import { Exclude, Expose, Type, plainToClass } from "class-transformer";

import { Participant } from "../../entity/Participant";
import { UserUsecaseDTO } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";

@Exclude()
export class ParticipantUsecaseDTO {
  @Expose() public id: string;
  @Expose() public name: string;
  @Expose() public userId: string;
  @Expose() public role: ParticipantRole;
  @Expose() public meetingId: string;
  @Expose()
  @Type(() => UserUsecaseDTO)
  public userInfo: UserUsecaseDTO;

  public static newFromEntity(entity: Participant): ParticipantUsecaseDTO {
    return plainToClass(ParticipantUsecaseDTO, entity);
  }

  public static newListFromEntitys(
    listEntitys: Participant[],
  ): ParticipantUsecaseDTO[] {
    return listEntitys.map((entity) => this.newFromEntity(entity));
  }
}
