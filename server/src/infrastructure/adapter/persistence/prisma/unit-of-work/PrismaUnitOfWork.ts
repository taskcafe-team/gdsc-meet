import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

import { UnitOfWork } from "@core/common/persistence/UnitOfWork";

import { PrismaUserRepositoryAdapter } from "../repository/PrismaUserRepositoryAdapter";
import { MeetingRepositoryPort } from "@core/domain/meeting/usecase/port/MeetingRepositoryPort";
import { PrismaMeetingRepositoryAdapter } from "../repository/PrismaMeetingRepositoryAdapter";
import { ParticipantRepositoryPort } from "@core/domain/participant/usecase/port/ParticipantRepositoryPort";
import { PrismaParticipantRepositoryAdapter } from "../repository/PrismaParticipantRepositoryAdapter";
import { UserRepositoryPort } from "@core/domain/user/usecase/port/UserRepositoryPort";
import { PrismaBaseRepository } from "../repository/PrismaBaseRepository";
import { PrismaService } from "../PrismaService";

type TransactionOptions = Parameters<PrismaClient["$transaction"]>[1];

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  private context: Prisma.TransactionClient;
  private repositories: Map<string, PrismaBaseRepository>;

  constructor(private readonly prisma: PrismaService) {
    this.context = prisma;
    this.repositories = new Map();
  }

  public async runInTransaction<T>(
    fn: () => Promise<T> | T,
    options?: TransactionOptions,
  ): Promise<T> {
    return await this.prisma.$transaction(
      async (ct) => {
        this.context = ct;
        const result = await fn();
        this.context = this.prisma;
        return result;
      },
      { maxWait: 10000, timeout: 10000 },
    );
  }

  private getRepo<T extends PrismaBaseRepository>(
    type: Prisma.ModelName,
    newRepo: () => T,
  ): T {
    const repo = this.repositories.get(type);
    if (!repo) this.repositories.set(type, newRepo());
    else if (repo._context !== this.context)
      this.repositories.get(type)!._context = this.context;
    return this.repositories.get(type)! as T;
  }

  public getUserRepository(): UserRepositoryPort {
    const type = Prisma.ModelName.User;
    return this.getRepo(
      type,
      () => new PrismaUserRepositoryAdapter(this.context),
    );
  }

  public getMeetingRepository(): MeetingRepositoryPort {
    const type = Prisma.ModelName.Meeting;
    return this.getRepo(
      type,
      () => new PrismaMeetingRepositoryAdapter(this.context),
    );
  }

  public getParticipantRepository(): ParticipantRepositoryPort {
    const type = Prisma.ModelName.Participant;
    return this.getRepo(
      type,
      () => new PrismaParticipantRepositoryAdapter(this.context),
    );
  }
}
