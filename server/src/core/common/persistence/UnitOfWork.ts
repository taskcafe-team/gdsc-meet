import { UserRepositoryPort } from "@core/domain/user/port/UserRepositoryPort";

export abstract class UnitOfWork {
  abstract runInTransaction<R>(fn: (context?: any) => Promise<R>): Promise<R>;
  abstract getContext();
  abstract getUserRepository(): UserRepositoryPort;
}
