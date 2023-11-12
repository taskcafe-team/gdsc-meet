import { IBaseRepository } from "@core/common/persistence/IBaseRepository";
import { Participant } from "../../entity/Participant";
import { RepositoryFindOptions } from "@core/common/persistence/RepositoryOptions";
import { ParticipantRole } from "@core/common/enums/ParticipantEnums";
import { Nullable } from "@core/common/type/CommonTypes";

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

export interface ParticipantRepositoryPort {
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
  ): Promise<Nullable<Participant>>;

  addParticipant(domain: Participant): Promise<Participant>;
}
