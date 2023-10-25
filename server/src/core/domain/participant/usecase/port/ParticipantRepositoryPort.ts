import { IBaseRepository } from "@core/common/persistence/IBaseRepository";
import { Participant } from "../../entity/Participant";
import { RepositoryFindOptions } from "@core/common/persistence/RepositoryOptions";
import { Optional } from "@core/common/type/CommonTypes";

export interface ParticipantRepositoryPort
  extends IBaseRepository<Participant> {
  findParticipant(
    by: { id?: string; userId?: string; meetingId: string },
    options?: RepositoryFindOptions,
  ): Promise<Optional<Participant>>;

  addParticipant(domain: Participant): Promise<Participant>;
}
