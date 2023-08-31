import { UserRepositoryPort } from "@core/domain/user/port/UserRepositoryPort";

export interface IUnitOfWork {
  getUserRepository(): UserRepositoryPort;

  setContext(context: any): void;
  start(): void;
  commit(): Promise<void>;
  rollback(): void;
}
