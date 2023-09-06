import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";

import { PrismaUserRepositoryAdapter } from "../repository/PrismaUserRepositoryAdapter";
import { PrismaService } from "../PrismaService";
import { PrismaBaseRepository } from "../repository/PrismaBaseRepository";

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  private context: Prisma.TransactionClient;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userRepository: PrismaUserRepositoryAdapter,
  ) {
    this.context = prismaService;
  }

  public async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return await this.prismaService.$transaction(async (context) => {
      const temp = this.context;
      this.context = context;
      const res = fn();
      this.context = temp;
      return await res;
    });
  }

  private getRepository<T extends PrismaBaseRepository<any>>(repo: T): T {
    if (repo.getContext() !== this.context) repo.setContext(this.context);
    return repo;
  }

  public getContext(): Prisma.TransactionClient {
    return this.context;
  }

  public getUserRepository() {
    return this.getRepository(this.userRepository);
  }
}
