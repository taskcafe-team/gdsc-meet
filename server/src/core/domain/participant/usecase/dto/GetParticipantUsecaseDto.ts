import { Exclude, Expose, plainToClass } from "class-transformer";

import { Participant } from "../../entity/Participant";

import { ParticipantUsecaseDTO } from "./ParticipantUsecaseDto";
import { UserUsecaseDTO } from "@core/domain/user/usecase/dto/UserUsecaseDto";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";

@Exclude()
export class GetParticipantUsecaseDTO implements ParticipantUsecaseDTO {
  @Expose() public id: string;
  @Expose() public name: string;
  @Expose() public userId: string;
  @Expose() public role: ParticipantRole;
  @Expose() public meetingId: string;

  @Expose() public userInfo: UserUsecaseDTO;

  public static newFromEntity(entity: Participant): GetParticipantUsecaseDTO {
    return plainToClass(ParticipantUsecaseDTO, entity);
  }

  public static newListFromEntitys(
    listEntitys: Participant[],
  ): GetParticipantUsecaseDTO[] {
    return listEntitys.map((entity) => this.newFromEntity(entity));
  }
}
