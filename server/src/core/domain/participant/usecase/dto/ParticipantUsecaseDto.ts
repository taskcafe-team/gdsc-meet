import { Exclude, Expose, Type, plainToClass } from "class-transformer";

import { Participant } from "../../entity/Participant";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";

@Exclude()
export class ParticipantUsecaseDto implements Partial<Participant> {
  @Expose() public id: string;
  @Expose() public name: string;
  @Expose() public userId: string;
  @Expose() public role: ParticipantRole;
  @Expose() public meetingId: string;
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
