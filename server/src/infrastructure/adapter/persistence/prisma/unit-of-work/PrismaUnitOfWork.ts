import { PrismaClient } from "@prisma/client";

import { IUnitOfWork } from "@core/common/persistence/IUnitOfWork";
import { UserRepositoryPort } from "@core/domain/user/port/UserRepositoryPort";

import { PrismaUserRepositoryAdapter } from "../repository/PrismaUserRepositoryAdapter";

export class PrismaUnitOfWork implements IUnitOfWork {
  private context: PrismaClient;
  private isInTransaction: boolean;

  private userRepository: PrismaUserRepositoryAdapter;

  constructor(context: PrismaClient = new PrismaClient()) {
    this.context = context;
    this.isInTransaction = false;
  }

  getUserRepository(): UserRepositoryPort {
    if (
      !this.userRepository ||
      this.userRepository.getContext() !== this.context
    ) {
      this.userRepository = new PrismaUserRepositoryAdapter(this.context);
    }

    return this.userRepository;
  }

  public setContext(context: PrismaClient) {
    this.context = context;
  }

  public async start(): Promise<void> {
    throw new Error("not implemented");
  }
  public async commit(): Promise<void> {
    throw new Error("not implemented");
  }
  public async rollback(): Promise<void> {
    throw new Error("not implemented");
  }
}
