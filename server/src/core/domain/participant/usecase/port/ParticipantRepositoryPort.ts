import { IBaseRepository } from "@core/common/persistence/IBaseRepository";
import { Participant } from "../../entity/Participant";
import { RepositoryFindOptions } from "@core/common/persistence/RepositoryOptions";
import { Optional } from "@core/common/type/CommonTypes";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";

export interface FindFirstParticipantById {
  id: string;
}

export interface FindFirstParticipantByUserId {
  userId: string;
  meetingId: string;
}

export interface FindFirstParticipantByRole {
  role: ParticipantRole;
  meetingId: string;
}

export type FindFirstParticipantBy =
  | FindFirstParticipantById
  | FindFirstParticipantByUserId
  | FindFirstParticipantByRole;

export interface ParticipantRepositoryPort
  extends IBaseRepository<Participant> {
  findManyParticipants(by: {
    id?: string;
    meetingId?: string;
    meetingIds?: string[];
    userId?: string;
    role?: ParticipantRole;
  }): Promise<Participant[]>;

  findParticipant<T extends FindFirstParticipantBy>(
    by: T,
    options?: RepositoryFindOptions,
  ): Promise<Optional<Participant>>;

  addParticipant(domain: Participant): Promise<Participant>;
}
