import { Exclude, Expose, plainToClass } from "class-transformer";

import { Participant } from "../../entity/Participant";

import { ParticipantUsecaseDto } from "./ParticipantUsecaseDto";
import { UserUsecaseDto } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";

@Exclude()
export class GetParticipantUsecaseDto implements ParticipantUsecaseDto {
  @Expose() public id: string;
  @Expose() public name: string;
  @Expose() public userId: string;
  @Expose() public role: ParticipantRole;
  @Expose() public meetingId: string;

  @Expose() public userInfo: UserUsecaseDto;

  public static newFromEntity(entity: Participant): GetParticipantUsecaseDto {
    return plainToClass(ParticipantUsecaseDto, entity);
  }

  public static newListFromEntitys(
    listEntitys: Participant[],
  ): GetParticipantUsecaseDto[] {
    return listEntitys.map((entity) => this.newFromEntity(entity));
  }
}
