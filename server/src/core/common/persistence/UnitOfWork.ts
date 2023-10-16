import { MeetingRepositoryPort } from "@core/domain/meeting/port/MeetingRepositoryPort";
import { ParticipantRepositoryPort } from "@core/domain/participant/usecase/port/ParticipantRepositoryPort";
import { UserRepositoryPort } from "@core/domain/user/port/UserRepositoryPort";

export abstract class UnitOfWork {
  abstract runInTransaction<R>(fn: (context?: any) => Promise<R>): Promise<R>;
  abstract getUserRepository(): UserRepositoryPort;
  abstract getMeetingRepository(): MeetingRepositoryPort;
  abstract getParticipantRepository(): ParticipantRepositoryPort;
}
